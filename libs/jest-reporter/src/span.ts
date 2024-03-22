import type {TestCase, TestRun, TestSuite} from '@allegoria/test-reporter-base'
import type {AggregatedResult} from '@jest/reporters';
import type {TestResult, AssertionResult} from '@jest/test-result';
import type {Config} from '@jest/types';
import {relativePath} from './path';
import {getFinishedTest} from './storage';

export function mapTestRun(
  results: AggregatedResult,
  globalConfig: Config.GlobalConfig,
): TestRun {
  const testSuiteEnd = Date.now();
  const suites = results.testResults.map((result) => mapTestSuite(result, globalConfig));
  return {
    start: results.startTime,
    end: testSuiteEnd,
    suites,
  };
}

export function mapTestSuite(
  result: TestResult,
  globalConfig: Config.GlobalConfig,
): TestSuite {
  const {path} = relativePath(globalConfig, result.testFilePath);
  const tests = result.testResults.map((caseResult) => mapTestCase(caseResult, result));
  return {
    start: result.perfStats.start,
    end: result.perfStats.end,
    path,
    tests
  };
}

export function mapTestCase(
  result: AssertionResult,
  testSuiteResult: TestResult,
): TestCase {
  const baseData = {
    name: result.title,
    ancestors: result.ancestorTitles,
  }

  if(result.status !== 'failed' && result.status !== 'passed') return {
    ...baseData,
    status: result.status
  };
  
  const {startedAt, finishedAt} =  getFinishedTest(testSuiteResult.testFilePath, result.fullName);
  return {
    ...baseData,
    start: startedAt,
    end: finishedAt,
    status: result.status,
    retries: (result.invocations ?? 1) - 1,
    retryReasons: result.retryReasons ?? [],
    failureMessages: result.failureMessages,
  };
}
