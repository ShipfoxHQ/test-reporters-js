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
    start,
    end: start + faker.number.int(),
    suites: [],
    ...overrides,
  };
}

export function genTestSuite(overrides?: Partial<TestSuite>): TestSuite {
  const start = faker.date.recent().getTime();
  return {
    start,
    end: start + faker.number.int(),
    path: faker.system.filePath(),
    tests: [],
    ...overrides,
  };
}

export function genNonExecutedTestCase(overrides?: Partial<NonExecutedTestCase>): TestCase {
  return {
    status: 'skipped',
    name: faker.lorem.words(),
    ancestors: [],
    ...overrides,
  };
}

export function genCompletedTestCase(overrides?: Partial<CompletedTestCase>): TestCase {
  const start = faker.date.recent().getTime();
  return {
    status: 'passed',
    name: faker.lorem.words(),
    ancestors: [],
    start,
    end: start + faker.number.int(),
    failureMessages: [],
    retries: 0,
    retryReasons: [],
    ...overrides,
  };
}
