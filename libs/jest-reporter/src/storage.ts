import type {TestCaseResult} from '@jest/test-result';

interface TestData {
  startedAt?: number;
  finishedAt?: number;
}

const testData: Record<string, Record<string, TestData>> = {};

export function addTestData(path: string, fullName: string, data: TestData) {
  if (!testData[path]) testData[path] = {};
  testData[path][fullName] = {...testData[path][fullName], ...data};
}

export function getTestData(path: string, fullName: string): TestData {
  return testData[path]?.[fullName] ?? {};
}

export function updateEndTimer(path: string, result: TestCaseResult) {
  const newDate = calculateEndTimer(path, result);
  addTestData(path, result.fullName, newDate);
}

function calculateEndTimer(path: string, result: TestCaseResult): TestData {
  const now = Date.now();
  if (!result.duration) return {finishedAt: now};

  const {startedAt} = getTestData(path, result.fullName);
  if (startedAt) return {finishedAt: startedAt + result.duration};
  return {startedAt: now - result.duration, finishedAt: now};
}
