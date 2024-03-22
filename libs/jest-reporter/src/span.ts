import type {AggregatedResult} from '@jest/reporters';
import type {TestResult, AssertionResult} from '@jest/test-result';
import type {Config} from '@jest/types';
import {type Context, trace, ROOT_CONTEXT, type Span, type Tracer, SpanKind} from '@opentelemetry/api';
import {relativePath} from './path';
import {getTestData} from './storage';

export function createTestRunSpan(
  results: AggregatedResult,
  tracer: Tracer,
  globalConfig: Config.GlobalConfig,
): Span {
  const testSuiteEnd = Date.now();
  const span = tracer.startSpan(
    'Test run',
    {
      startTime: results.startTime,
      attributes: {
        'allegoria.type': 'test.run',
      },
    },
    ROOT_CONTEXT,
  );
  const context = trace.setSpan(ROOT_CONTEXT, span);
  results.testResults.forEach((result) => {
    createTestSuiteSpan(result, context, tracer, globalConfig);
  });
  span.end(testSuiteEnd);
  return span;
}

export function createTestSuiteSpan(
  result: TestResult,
  parentContext: Context,
  tracer: Tracer,
  globalConfig: Config.GlobalConfig,
): Span {
  const {path} = relativePath(globalConfig, result.testFilePath);
  const span = tracer.startSpan(
    path,
    {
      kind: SpanKind.INTERNAL,
      startTime: result.perfStats.start,
      attributes: {
        'allegoria.type': 'test.suite',
        'test.suite.path': path,
      },
    },
    parentContext,
  );

  const context = trace.setSpan(parentContext, span);
  result.testResults.forEach((caseResult) =>
    createTestCaseSpan(caseResult, result, context, tracer),
  );
  span.end(result.perfStats.end);
  return span;
}

export function createTestCaseSpan(
  result: AssertionResult,
  testSuiteResult: TestResult,
  parentContext: Context,
  tracer: Tracer,
): Span {
  const {startedAt, finishedAt} = getTestData(testSuiteResult.testFilePath, result.fullName);
  const span = tracer.startSpan(
    result.fullName,
    {
      kind: SpanKind.INTERNAL,
      startTime: startedAt,
      attributes: {
        'allegoria.type': 'test.case',
        'test.case.name': result.title,
        'test.case.name.full': result.fullName,
        'test.case.ancestors.title': result.ancestorTitles,
        'test.case.status': result.status,
        'test.case.failure.messages': result.failureMessages,
        'test.case.invocations': result.invocations,
        'test.case.retry.reasons': result.retryReasons,
      },
    },
    parentContext,
  );
  span.end(finishedAt);
  return span;
}
