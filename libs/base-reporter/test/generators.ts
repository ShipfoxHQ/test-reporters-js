import {faker} from '@faker-js/faker';
import type {
  TestRun,
  TestSuite,
  NonExecutedTestCase,
  TestCase,
  CompletedTestCase,
} from '../src/span';

export function genTestRun(overrides?: Partial<TestRun>): TestRun {
  const start = faker.date.recent().getTime();
  return {
    configPath: faker.system.directoryPath(),
    status: 'passed',
    start,
    end: start + faker.number.int(),
    suites: [],
    ...overrides,
  };
}

export function genTestSuite(overrides?: Partial<TestSuite>): TestSuite {
  const start = faker.date.recent().getTime();
  return {
    status: 'passed',
    start,
    end: start + faker.number.int(),
    path: faker.system.filePath(),
    tests: [],
    ...overrides,
  };
}

export function genNonExecutedTestCase(overrides?: Partial<NonExecutedTestCase>): TestCase {
  const title = faker.lorem.words();
  return {
    status: 'skipped',
    title,
    titlePath: [title],
    ...overrides,
  };
}

export function genCompletedTestCase(overrides?: Partial<CompletedTestCase>): TestCase {
  const start = faker.date.recent().getTime();
  const title = faker.lorem.words();
  return {
    status: 'passed',
    title,
    titlePath: [title],
    start,
    end: start + faker.number.int(),
    failureMessages: [],
    retries: 0,
    retryReasons: [],
    ...overrides,
  };
}
