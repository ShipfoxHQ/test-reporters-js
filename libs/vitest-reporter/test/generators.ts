import {faker} from '@faker-js/faker';
import type {File, Suite, Test, TaskContext, TestContext, TaskResult} from 'vitest';

export function genTaskResult(overrides: Partial<TaskResult> = {}): TaskResult {
  return {
    state: 'pass',
    startTime: faker.date.recent().getTime(),
    duration: faker.number.int(),
    ...overrides,
  };
}

export function genFile(overrides: Partial<File> = {}): File {
  return {
    id: faker.string.uuid(),
    name: faker.system.fileName(),
    mode: 'run',
    meta: {},
    filepath: faker.system.filePath(),
    type: 'suite',
    tasks: [],
    projectName: '',
    result: genTaskResult(),
    ...overrides,
  };
}

export function genSuite(overrides: Partial<Suite> = {}): Suite {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(),
    mode: 'run',
    meta: {},
    type: 'suite',
    tasks: [],
    projectName: '',
    result: genTaskResult(),
    ...overrides,
  };
}

export function genTest(overrides: Partial<Test> & {suite: Suite}): Test {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.sentence(),
    mode: 'run',
    meta: {},
    type: 'test',
    context: {} as TaskContext<Test> & TestContext,
    result: genTaskResult(),
    ...overrides,
  };
}
