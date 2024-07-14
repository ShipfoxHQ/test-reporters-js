import {type Context, trace, ROOT_CONTEXT, type Span, type Tracer} from '@opentelemetry/api';
import {getRunAttributes, getSuiteAttributes, getCaseAttributes} from './attributes';
import {getTracer, shutdown} from './tracing';
import type {TestRun, TestSuite, TestCase, Parent} from './types';
import {getTiming, handleError, TEST_RUN_START_KEY} from './utils';

const PARENT_KEY = Symbol('parent');

export async function sendTestRun(run: TestRun): Promise<void> {
  try {
    await createTestRunSpan(run);
    await shutdown();
  } catch (error) {
    handleError(error);
  }
}

export async function createTestRunSpan(run: TestRun): Promise<Span[]> {
  const tracer = getTracer();
  const parentContext = ROOT_CONTEXT;
  const {startTime, endTime} = getTiming(run, parentContext);

  const {attributes, ...contextData} = await getRunAttributes(run);

  const span = tracer.startSpan('Test run', {startTime, attributes}, parentContext);
  const context = trace
    .setSpan(parentContext, span)
    .setValue(TEST_RUN_START_KEY, run.start)
    .setValue(PARENT_KEY, contextData as Parent);

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
  const parent = parentContext.getValue(PARENT_KEY) as Parent;
  const {attributes, ...contextData} = getSuiteAttributes(suite, parent);

  const span = tracer.startSpan(suite.path, {startTime, attributes}, parentContext);

  const context = trace.setSpan(parentContext, span).setValue(PARENT_KEY, contextData);
  const children = suite.tests.map((test) => createTestCaseSpan(test, context, tracer));
  span.end(endTime);
  return [span, ...children];
}

export function createTestCaseSpan(test: TestCase, parentContext: Context, tracer: Tracer): Span {
  const {startTime, endTime} = getTiming(test, parentContext);

  const parent = parentContext.getValue(PARENT_KEY) as Parent;
  const {attributes} = getCaseAttributes(test, parent);

  const span = tracer.startSpan(test.title, {startTime, attributes}, parentContext);
  span.end(endTime);
  return span;
}
