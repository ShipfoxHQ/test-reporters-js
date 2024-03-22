import {initializeTracing, type BaseOptions} from '@allegoria/test-reporter-base'
import type {Config, TestContext, AggregatedResult} from '@jest/reporters';
import type {Tracer} from '@opentelemetry/api';
import {BasicTracerProvider} from '@opentelemetry/sdk-trace-base';
import type {Reporter, Vitest, File, TaskResultPack} from 'vitest'
import type { a7 } from 'vitest/dist/reporters-P7C2ytIv';

export type AllegoriaReporterOptions = BaseOptions

export default class AllegoriaReporter implements Reporter {
  tracer: Tracer | undefined
  provider: BasicTracerProvider | undefined
  
  onInit(context: Vitest): void {
    context.config.config
    const {tracer, provider} = initializeTracing();
    this.tracer = tracer;
    this.provider = provider;
  }

  onTaskUpdate(packs: TaskResultPack[]) {
    console.log(packs)
  }
}