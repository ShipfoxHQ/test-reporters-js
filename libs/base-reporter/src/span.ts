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
import {TEST_RUN_START_KEY, getTiming} from './utils';

const TEST_FILLE_PATH_KEY = Symbol('test.file.path');

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

export function createTestRunSpan(run: TestRun): Span[] {
  const tracer = getTracer();
  const parentContext = ROOT_CONTEXT;
  const {startTime, endTime} = getTiming(run, parentContext);
  const span = tracer.startSpan(
    'Test run',
    {
      startTime,
      attributes: {
        'allegoria.type': 'test.run',
      },
    },
    parentContext,
  );
  const context = trace.setSpan(ROOT_CONTEXT, span).setValue(TEST_RUN_START_KEY, run.start);
  const children = run.suites.map((suite) => createTestSuiteSpan(suite, context, tracer)).flat();
  span.end(endTime);
  return [span, ...children];
}

export function createTestSuiteSpan(
  suite: TestSuite,
  parentContext: Context,
  tracer: Tracer,
): Span[] {
  const {startTime, endTime} = getTiming(suite, parentContext);
  const span = tracer.startSpan(
    suite.path,
    {
      kind: SpanKind.INTERNAL,
      startTime,
      attributes: {
        'allegoria.type': 'test.suite',
        'test.suite.path': suite.path,
      },
    },
    parentContext,
  );

  const context = trace.setSpan(parentContext, span).setValue(TEST_FILLE_PATH_KEY, suite.path);
  const children = suite.tests.map((test) => createTestCaseSpan(test, context, tracer));
  span.end(endTime);
  return [span, ...children];
}

export function createTestCaseSpan(test: TestCase, parentContext: Context, tracer: Tracer): Span {
  const {startTime, endTime} = getTiming(test, parentContext);
  const span = tracer.startSpan(
    test.name,
    {
      kind: SpanKind.INTERNAL,
      startTime,
      attributes: getTestCaseSpanAttributes(test, parentContext),
    },
    parentContext,
  );
  span.end(endTime);
  return span;
}

function getTestCaseSpanAttributes(test: TestCase, parentContext: Context) {
  const attributes = {
    'allegoria.type': 'test.case',
    'test.case.name': test.name,
    'test.case.ancestors.title': test.ancestors,
    'test.case.status': test.status,
    'test.suite.path': parentContext.getValue(TEST_FILLE_PATH_KEY) as string,
  };
  if (test.status !== 'failed' && test.status !== 'passed') return attributes;
  return {
    ...attributes,
    'test.case.failure.messages': test.failureMessages,
    'test.case.retry.count': test.retries,
    'test.case.retry.reasons': test.retryReasons,
  };
}
