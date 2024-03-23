import {initializeTracing, type BaseOptions} from '@allegoria/test-reporter-base'
import type {Tracer} from '@opentelemetry/api';
import {BasicTracerProvider} from '@opentelemetry/sdk-trace-base';
import type {Reporter, Vitest, File, TaskResultPack} from 'vitest'
import {createTestSuite} from './span'

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

  onFinished (files?: File[] | undefined, errors?: unknown[] | undefined) {
    const spans = files?.map(file => createTestSuite(file))
  }
}