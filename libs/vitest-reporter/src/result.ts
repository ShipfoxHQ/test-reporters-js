import {relative} from 'node:path';
import type {TestSuite, TestCase, ExecutionStatus} from '@allegoria/test-reporter-base';
import type {Task, TaskResult, File, Vitest, RunMode, Suite} from 'vitest';

type CompletedTaskResult = Omit<TaskResult, 'startTime' | 'duration'> & {
  startTime: NonNullable<TaskResult['startTime']>;
  duration?: NonNullable<TaskResult['duration']>;
};

function getTaskResult(task: Task): CompletedTaskResult {
  const result = task.result;
  if (!result) throw new Error(`Task result not found "${task.name}"`);
  if (typeof result.startTime !== 'number')
    throw new Error(`Task start time not found "${task.name}"`);
  return result as CompletedTaskResult;
}

function getLocalPath(path: string, context: Vitest): string {
  const root = context.config.root;
  return relative(root, path);
}

export function getSuiteStatus(suite: Suite): ExecutionStatus {
  if (suite.result?.state === 'skip') return 'skipped';
  if (suite.result?.state === 'pass') return 'success';
  return 'failure';
}

export function createDataFromFile(file: File, context: Vitest): TestSuite {
  const result = getTaskResult(file);
  const tests = file.tasks.map((task) => createDataFromTask(task)).flat();
  return {
    path: getLocalPath(file.filepath, context),
    start: result.startTime,
    end: result.startTime + (result.duration ?? 0),
    tests,
    status: getSuiteStatus(file),
  };
}

function getParentMode(task: Task): RunMode {
  if (!task.suite) return 'run';
  const mode = task.suite.mode;
  if (mode !== 'run') return mode;
  if (task.suite.suite) return getParentMode(task.suite);
  return 'run';
}

export function createDataFromTask(task: Task, parentTitlePath: string[] = []): TestCase[] {
  const titlePath = [...parentTitlePath, task.name];
  if (task.type === 'custom') throw new Error(`Can not handle custom task "${task.name}"`);
  // Do not report any todo test
  if (task.mode === 'todo') return [];
  if (task.type === 'suite') {
    return task.tasks.map((subTask) => createDataFromTask(subTask, titlePath)).flat();
  }
  const parentMode = getParentMode(task);
  if (task.mode !== 'run' || parentMode !== 'run') {
    const consideredMode = parentMode !== 'run' ? parentMode : task.mode;
    if (['pending', 'focused'].includes(consideredMode))
      throw new Error(`Can not handle pending or focused tasks "${task.name}"`);
    return [
      {
        status: 'skipped',
        titlePath,
        title: task.name,
      },
    ];
  }
  const result = getTaskResult(task);
  return [
    {
      status: result.state === 'pass' ? 'success' : 'failure',
      titlePath,
      title: task.name,
      start: result.startTime,
      end: result.startTime + (result.duration ?? 0),
      retries: task.retry ?? 0,
      retryReasons: [],
      failureMessages: [],
    },
  ];
}
