import type {TestCaseResult} from '@jest/test-result';

interface StartedTestData {
  startedAt: number;
}

interface FinishedTestData {
  startedAt: number;
  finishedAt: number;
}

const startedTests: Record<string, Record<string, StartedTestData>> = {};
const finishedTests: Record<string, Record<string, FinishedTestData>> = {};

export function storeStartedTest(path: string, fullName: string, data: StartedTestData) {
  if (!startedTests[path]) startedTests[path] = {};
  startedTests[path][fullName] = {...startedTests[path][fullName], ...data};
}

export function getStartedTest(path: string, fullName: string): StartedTestData {
  const test = startedTests[path]?.[fullName];
  if (!test) throw new Error(`Test not found in storage ${path} ${fullName}`);
  return test;
}

export function storeFinishedTest(path: string, fullName: string, data: FinishedTestData) {
  if (!finishedTests[path]) finishedTests[path] = {};
  finishedTests[path][fullName] = {...finishedTests[path][fullName], ...data};
}

export function getFinishedTest(path: string, fullName: string): FinishedTestData {
  const test = finishedTests[path]?.[fullName];
  if (!test) throw new Error(`Test not found in storage ${path} ${fullName}`);
  return test;
}
export function updateEndTimer(path: string, result: TestCaseResult) {
  if (typeof result.duration !== 'number') throw new Error(`Test duration not found ${path} ${result.fullName}`);
  const {startedAt} = getStartedTest(path, result.fullName);
  storeFinishedTest(path, result.fullName, {startedAt, finishedAt: startedAt + result.duration});
}
