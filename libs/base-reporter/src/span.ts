import {randomBytes} from 'node:crypto';
import {relative} from 'node:path';
import {
  type Context,
  trace,
  ROOT_CONTEXT,
  type Span,
  type Tracer,
  type TimeInput,
} from '@opentelemetry/api';
import {getTracer, shutdown} from './tracing';
import {
  TEST_RUN_START_KEY,
  getTiming,
  getRepositoryUrl,
  hash32HexDigits,
  handleError,
  getGitRoot,
} from './utils';

const TEST_FILLE_PATH_KEY = Symbol('testFilePath');
export const RAW_RESOURCE_ID_KEY = Symbol('rawResourceId');

export type ExecutionStatus = 'passed' | 'failed' | 'skipped';

export type TestCase = (CompletedTestCase | NonExecutedTestCase) & {
  title: string;
  titlePath: string[];
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
  status: ExecutionStatus;
}

export interface TestRun {
  configPath: string;
  start: TimeInput;
  end: TimeInput;
  suites: TestSuite[];
  status: ExecutionStatus;
}

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

  const repositoryUrl = await getRepositoryUrl();
  const repositoryRoot = await getGitRoot();
  console.log('Repository root', repositoryRoot);
  const relativeConfigPath = relative(repositoryRoot, run.configPath);
  const rawResourceId = `${repositoryUrl}-${relativeConfigPath}`;

  const span = tracer.startSpan(
    'Test run',
    {
      startTime,
      attributes: {
        'execution.type': 'test.run',
        'execution.status': run.status,
        'test.run.id': hash32HexDigits(rawResourceId),
        'test.run.config_path': relativeConfigPath,
        'test.run.execution.id': randomBytes(16).toString('hex'),
      },
    },
    parentContext,
  );
  const context = trace
    .setSpan(ROOT_CONTEXT, span)
    .setValue(TEST_RUN_START_KEY, run.start)
    .setValue(RAW_RESOURCE_ID_KEY, repositoryUrl);
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
  const parentRawResourceId = parentContext.getValue(RAW_RESOURCE_ID_KEY) as string;
  const rawResourceId = `${parentRawResourceId}-${suite.path}`;

  const span = tracer.startSpan(
    suite.path,
    {
      startTime,
      attributes: {
        'execution.type': 'test.suite',
        'execution.status': suite.status,
        'test.suite.id': hash32HexDigits(rawResourceId),
        'test.suite.path': suite.path,
        'test.suite.execution.id': randomBytes(16).toString('hex'),
      },
    },
    parentContext,
  );

  const context = trace
    .setSpan(parentContext, span)
    .setValue(TEST_FILLE_PATH_KEY, suite.path)
    .setValue(RAW_RESOURCE_ID_KEY, rawResourceId);
  const children = suite.tests.map((test) => createTestCaseSpan(test, context, tracer));
  span.end(endTime);
  return [span, ...children];
}

export function createTestCaseSpan(test: TestCase, parentContext: Context, tracer: Tracer): Span {
  const {startTime, endTime} = getTiming(test, parentContext);

  const span = tracer.startSpan(
    test.title,
    {
      startTime,
      attributes: getTestCaseSpanAttributes(test, parentContext),
    },
    parentContext,
  );
  span.end(endTime);
  return span;
}

function getTestCaseSpanAttributes(test: TestCase, parentContext: Context) {
  const parentRawResourceId = parentContext.getValue(RAW_RESOURCE_ID_KEY) as string;
  const rawResourceId = `${parentRawResourceId}-${test.titlePath.join('-')}`;
  const attributes = {
    'execution.type': 'test.case',
    'execution.status': test.status,
    'test.case.id': hash32HexDigits(rawResourceId),
    'test.case.title': test.title,
    'test.case.titlePath': test.titlePath,
    'test.case.execution.id': randomBytes(16).toString('hex'),
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
