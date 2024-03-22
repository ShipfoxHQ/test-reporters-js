import {type BaseOptions, initializeTracing, onError, createTestRunSpan} from '@allegoria/test-reporter-base';
import type {Config, Reporter, TestContext, AggregatedResult} from '@jest/reporters';
import type {Test, TestCaseResult} from '@jest/test-result';
import type {Circus} from '@jest/types';
import type {Tracer} from '@opentelemetry/api';
import {BasicTracerProvider} from '@opentelemetry/sdk-trace-base';
import {mapTestRun} from './span'
import {storeStartedTest, updateEndTimer} from './storage';

export type AllegoriaReporterOptions = BaseOptions & {
  enabled?: boolean;
}

export default class AllegoriaReporter implements Reporter {
  protected readonly enabled: boolean;
  protected readonly globalConfig: Config.GlobalConfig;
  protected readonly tracer: Tracer | undefined;
  protected readonly provider: BasicTracerProvider | undefined;

  constructor(globalConfig: Config.GlobalConfig, options?: AllegoriaReporterOptions) {
    this.enabled = options?.enabled ?? true;
    this.globalConfig = globalConfig;
    if(!this.enabled) return;
    const {tracer, provider} = initializeTracing(options);
    this.tracer = tracer;
    this.provider = provider;
  }

  onTestCaseStart(test: Test, testCase: Circus.TestCaseStartInfo): void {
    if(!this.enabled) return;
    storeStartedTest(test.path, testCase.fullName, {startedAt: testCase.startedAt ?? Date.now()});
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    if(!this.enabled) return;
    updateEndTimer(test.path, testCaseResult);
  }

  public async onRunComplete(
    testContexts: Set<TestContext>,
    results: AggregatedResult,
  ): Promise<void> {
    if(!this.enabled) return;
    if(!this.tracer || !this.provider) throw new Error('Tracing was not initialized');
    const testRun = mapTestRun(results, this.globalConfig);
    createTestRunSpan(testRun, this.tracer);
    try {
      await this.provider.shutdown();
    } catch (error) {
      onError(error);
    }
  }
}
