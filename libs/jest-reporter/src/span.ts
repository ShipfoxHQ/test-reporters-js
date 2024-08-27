import type {TestCase, TestRun, TestSuite} from '@shipfox/test-reporter-base';
import type {AggregatedResult} from '@jest/reporters';
import type {TestResult, AssertionResult} from '@jest/test-result';
import type {Config} from '@jest/types';
import {relativePath} from './path';
import {getFinishedTest} from './storage';

export function mapTestRun(results: AggregatedResult, globalConfig: Config.GlobalConfig): TestRun {
  const testSuiteEnd = Date.now();
  const suites = results.testResults.map((result) => mapTestSuite(result, globalConfig));
  return {
    configPath: globalConfig.rootDir,
    status: results.numFailedTestSuites > 0 ? 'failure' : 'success',
    start: results.startTime,
    end: testSuiteEnd,
    suites,
  };
}

export function mapTestSuite(result: TestResult, globalConfig: Config.GlobalConfig): TestSuite {
  const {path} = relativePath(globalConfig, result.testFilePath);
  const tests = result.testResults
    .filter((testCase) => testCase.status !== 'todo')
    .map((caseResult) => mapTestCase(caseResult, result));

  return {
    status: result.numFailingTests > 0 ? 'failure' : 'success',
    start: result.perfStats.start,
    end: result.perfStats.end,
    path,
    tests,
  };
}

export function mapTestCase(result: AssertionResult, testSuiteResult: TestResult): TestCase {
  const baseData = {
    title: result.title,
    titlePath: [...result.ancestorTitles, result.title],
  };

  if (result.status === 'pending')
    return {
      ...baseData,
      status: 'skipped',
    };

  if (result.status !== 'failed' && result.status !== 'passed')
    throw new Error(`Unknown status ${result.status} for "${result.fullName}"`);

  const {startedAt, finishedAt} = getFinishedTest(testSuiteResult.testFilePath, result.fullName);
  return {
    ...baseData,
    start: startedAt,
    end: finishedAt,
    status: result.status === 'failed' ? 'failure' : 'success',
    retries: (result.invocations ?? 1) - 1,
    retryReasons: result.retryReasons ?? [],
    failureMessages: result.failureMessages,
  };
}
