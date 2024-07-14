import type {TimeInput, Attributes} from '@opentelemetry/api';

export type ExecutionStatus = 'success' | 'failure' | 'skipped';

export type TestCase = (CompletedTestCase | NonExecutedTestCase) & {
  title: string;
  titlePath: string[];
};

export interface CompletedTestCase {
  status: 'success' | 'failure';
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

export interface Parent {
  rawResourceId: string;
  propagatedAttributes: Attributes;
}
