import {relative} from 'node:path';
import type {TestSuite, TestCase} from '@allegoria/test-reporter-base';
import type {Task, TaskResult, TaskState, File, Vitest, RunMode} from 'vitest';

type CompletedTaskResult = Omit<TaskResult, 'startTime' | 'duration'> & {
  startTime: NonNullable<TaskResult['startTime']>;
  duration: NonNullable<TaskResult['duration']>;
};

const stateMap: Record<TaskState, TestCase['status']> = {
  pass: 'passed',
  fail: 'failed',
  run: 'pending',
  skip: 'skipped',
  only: 'focused',
  todo: 'todo',
};

function getTaskResult(task: Task): CompletedTaskResult {
  const result = task.result;
  if (!result) throw new Error(`Task result not found "${task.name}"`);
  if (typeof result.startTime !== 'number')
    throw new Error(`Task start time not found "${task.name}"`);
  if (typeof result.duration !== 'number')
    throw new Error(`Task duration not found "${task.name}"`);
  return result as CompletedTaskResult;
}

function getLocalPath(path: string, context: Vitest): string {
  const root = context.config.root;
  return relative(root, path);
}

export function createDataFromFile(file: File, context: Vitest): TestSuite {
  const result = getTaskResult(file);

  if (file.mode !== 'run')
    throw new Error(`File was reported but not executed not found "${file.filepath}"`);
  return {
    path: getLocalPath(file.filepath, context),
    start: result.startTime,
    end: result.startTime + result.duration,
    tests: file.tasks.map((task) => createDataFromTask(task)).flat(),
  };
}

function getParentMode(task: Task): RunMode {
  if (!task.suite) return 'run';
  const mode = task.suite.mode;
  if (mode !== 'run') return mode;
  if (task.suite.suite) return getParentMode(task.suite);
  return 'run';
}

export function createDataFromTask(task: Task, ancestors: string[] = []): TestCase[] {
  if (task.type === 'custom') throw new Error(`Can not handle custom task "${task.name}"`);
  // Do not report any todo test
  if (task.mode === 'todo') return [];
  if (task.type === 'suite') {
    return task.tasks
      .map((subTask) => createDataFromTask(subTask, [...ancestors, task.name]))
      .flat();
  }
  const parentMode = getParentMode(task);
  if (task.mode !== 'run' || parentMode !== 'run') {
    const consideredMode = parentMode !== 'run' ? parentMode : task.mode;
    if (['pending', 'focused'].includes(consideredMode))
      throw new Error(`Can not handle pending or focused tasks "${task.name}"`);
    return [
      {
        status: stateMap[consideredMode] as 'skipped',
        ancestors,
        name: task.name,
      },
    ];
  }
  const result = getTaskResult(task);
  return [
    {
      status: stateMap[result.state] as 'passed' | 'failed',
      ancestors,
      name: task.name,
      start: result.startTime,
      end: result.startTime + result.duration,
      retries: task.retry ?? 0,
      retryReasons: [],
      failureMessages: [],
    },
  ];
}
