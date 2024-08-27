import {join} from 'node:path';
import {
  init,
  setOptions,
  type BaseOptions,
  sendTestRun,
  getVersionFromPackageJson,
  getPackageVersion,
} from '@shipfox/test-reporter-base';
import type {Reporter, File, Vitest} from 'vitest';
import {createDataFromFile} from './result';

export type ShipfoxReporterOptions = BaseOptions & {
  enabled?: boolean;
};

export default class ShipfoxReporter implements Reporter {
  start: number;
  enabled: boolean;
  context: Vitest | undefined;

  constructor(options?: ShipfoxReporterOptions) {
    this.start = Date.now();
    this.enabled = options?.enabled ?? true;
    if (!this.enabled) return;
    setOptions(options);
  }

  async onInit(context: Vitest) {
    this.context = context;
    if (!this.enabled) return;
    await init({
      runner: {name: 'vitest', version: getPackageVersion('vitest')},
      reporter: {
        name: '@shipfox/vitest-reporter',
        version: getVersionFromPackageJson(join(__dirname, '../package.json')),
      },
    });
  }

  async onFinished(files: File[] = []): Promise<void> {
    if (!this.enabled) return;
    const context = this.context;
    if (!context) throw new Error(`Vitest context not found`);
    const configPath = context.projects[0].path as string;
    const end = Date.now();
    const suites = files.map((file) => createDataFromFile(file, context));
    await sendTestRun({
      configPath,
      start: this.start,
      end,
      suites,
      status: suites.some((suite) => suite.status === 'failure') ? 'failure' : 'success',
    });
  }
}
