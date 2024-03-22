import type {Config, Reporter, TestContext, AggregatedResult} from '@jest/reporters';
import type {Test, TestCaseResult} from '@jest/test-result';
import type {Circus} from '@jest/types';
import type {Tracer} from '@opentelemetry/api';
import {BasicTracerProvider} from '@opentelemetry/sdk-trace-base';
import type {AllegoriaReporterOptions} from './options';
import {createTestRunSpan} from './span';
import {addTestData, updateEndTimer} from './storage';
import {initializeTracing, onError} from './tracing';

export type {AllegoriaReporterOptions} from './options';

export default class AllegoriaReporter implements Reporter {
  protected readonly globalConfig: Config.GlobalConfig;
  protected readonly tracer: Tracer;
  protected readonly provider: BasicTracerProvider;

  constructor(globalConfig: Config.GlobalConfig, options?: AllegoriaReporterOptions) {
    this.globalConfig = globalConfig;
    const {tracer, provider} = initializeTracing(options);
    this.tracer = tracer;
    this.provider = provider;
  }

  onTestCaseStart(test: Test, testCase: Circus.TestCaseStartInfo): void {
    addTestData(test.path, testCase.fullName, {startedAt: testCase.startedAt ?? undefined});
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    updateEndTimer(test.path, testCaseResult);
  }

  public async onRunComplete(
    testContexts: Set<TestContext>,
    results: AggregatedResult,
  ): Promise<void> {
    createTestRunSpan(results, this.tracer, this.globalConfig);

    try {
      await this.provider.shutdown();
    } catch (error) {
      onError(error);
    }
  }
}
