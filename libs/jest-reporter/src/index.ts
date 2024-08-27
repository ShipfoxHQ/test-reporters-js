import {join} from 'path';
import {
  type BaseOptions,
  setOptions,
  init,
  sendTestRun,
  getPackageVersion,
  getVersionFromPackageJson,
} from '@shipfox/test-reporter-base';
import type {Config, Reporter, TestContext, AggregatedResult} from '@jest/reporters';
import type {Test, TestCaseResult} from '@jest/test-result';
import type {Circus} from '@jest/types';
import {mapTestRun} from './span';
import {storeStartedTest, updateEndTimer} from './storage';

export type ShipfoxReporterOptions = BaseOptions & {
  enabled?: boolean;
};

export default class ShipfoxReporter implements Reporter {
  protected readonly enabled: boolean;
  protected readonly globalConfig: Config.GlobalConfig;

  constructor(globalConfig: Config.GlobalConfig, options?: ShipfoxReporterOptions) {
    this.enabled = options?.enabled ?? true;
    this.globalConfig = globalConfig;
    if (!this.enabled) return;
    setOptions(options);
  }

  async onRunStart(): Promise<void> {
    if (!this.enabled) return;
    await init({
      runner: {name: 'jest', version: getPackageVersion('jest')},
      reporter: {
        name: '@shipfox/jest-reporter',
        version: getVersionFromPackageJson(join(__dirname, '../package.json')),
      },
    });
  }

  onTestCaseStart(test: Test, testCase: Circus.TestCaseStartInfo): void {
    if (!this.enabled) return;
    storeStartedTest(test.path, testCase.fullName, {startedAt: testCase.startedAt ?? Date.now()});
  }

  onTestCaseResult(test: Test, testCaseResult: TestCaseResult): void {
    if (!this.enabled) return;
    if (testCaseResult.status === 'todo') return;
    updateEndTimer(test.path, testCaseResult);
  }

  public async onRunComplete(
    testContexts: Set<TestContext>,
    results: AggregatedResult,
  ): Promise<void> {
    if (!this.enabled) return;
    const testRun = mapTestRun(results, this.globalConfig);
    await sendTestRun(testRun);
  }
}
