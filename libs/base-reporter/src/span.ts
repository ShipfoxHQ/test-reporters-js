import {
  type Context,
  trace,
  ROOT_CONTEXT,
  type Span,
  type Tracer,
  SpanKind,
  type TimeInput,
} from '@opentelemetry/api';
import {getTracer, shutdown} from './tracing';

export type TestCase = (CompletedTestCase | NonExecutedTestCase) & {
  name: string;
  ancestors: string[];
};

export interface CompletedTestCase {
  status: 'passed' | 'failed';
  start: TimeInput;
  end: TimeInput;
  retries: number;
  retryReasons: string[];
  failureMessages: string[];
}

export interface NonExecutedTestCase {
  status: 'skipped';
}

export interface TestSuite {
  start: TimeInput;
  end: TimeInput;
  tests: TestCase[];
  path: string;
}

export interface TestRun {
  start: TimeInput;
  end: TimeInput;
  suites: TestSuite[];
}

export async function sendTestRun(run: TestRun): Promise<void> {
  createTestRunSpan(run);
  await shutdown();
}

export function createTestRunSpan(run: TestRun): Span {
  const tracer = getTracer();
  const span = tracer.startSpan(
    'Test run',
    {
      startTime: run.start,
      attributes: {
        'allegoria.type': 'test.run',
      },
    },
    ROOT_CONTEXT,
  );
  const context = trace.setSpan(ROOT_CONTEXT, span);
  run.suites.forEach((suite) => {
    createTestSuiteSpan(suite, context, tracer);
  });
  span.end(run.end);
  return span;
}

export function createTestSuiteSpan(
  suite: TestSuite,
  parentContext: Context,
  tracer: Tracer,
): Span {
  const span = tracer.startSpan(
    suite.path,
    {
      kind: SpanKind.INTERNAL,
      startTime: suite.start,
      attributes: {
        'allegoria.type': 'test.suite',
        'test.suite.path': suite.path,
      },
    },
    parentContext,
  );

  const context = trace.setSpan(parentContext, span);
  suite.tests.forEach((test) => createTestCaseSpan(test, context, tracer));
  span.end(suite.end);
  return span;
}

export function createTestCaseSpan(test: TestCase, parentContext: Context, tracer: Tracer): Span {
  const span = tracer.startSpan(
    test.name,
    {
      kind: SpanKind.INTERNAL,
      startTime: 'start' in test ? test.start : 0,
      attributes: getTestCaseSpanAttributes(test),
    },
    parentContext,
  );
  span.end('end' in test ? test.end : 0);
  return span;
}

function getTestCaseSpanAttributes(test: TestCase) {
  const attributes = {
    'allegoria.type': 'test.case',
    'test.case.name': test.name,
    'test.case.ancestors.title': test.ancestors,
    'test.case.status': test.status,
  };
  if (test.status !== 'failed' && test.status !== 'passed') return attributes;
  return {
    ...attributes,
    'test.case.failure.messages': test.failureMessages,
    'test.case.retry.count': test.retries,
    'test.case.retry.reasons': test.retryReasons,
  };
}
