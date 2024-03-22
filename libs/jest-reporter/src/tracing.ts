import {trace} from '@opentelemetry/api';
import {setGlobalErrorHandler} from '@opentelemetry/core';
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {CompressionAlgorithm} from '@opentelemetry/otlp-exporter-base';
import {Resource} from '@opentelemetry/resources';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {SEMRESATTRS_PROCESS_RUNTIME_NAME} from '@opentelemetry/semantic-conventions';
import type {AllegoriaReporterOptions} from './options';

let succeedOnExportFailure = false;

export function onError(error: unknown): void {
  if (error instanceof AggregateError) {
    for (const err of error.errors) {
      onError(err);
    }
    return;
  }
  console.error('Failed to push test results to Allegoria');
  console.error(error);
  if (!succeedOnExportFailure) process.exit(1);
}

export function initializeTracing(options?: AllegoriaReporterOptions) {
  succeedOnExportFailure = options?.succeedOnExportFailure ?? false;
  setGlobalErrorHandler(onError);
  const provider = new BasicTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_PROCESS_RUNTIME_NAME]: 'jest',
    }),
  });
  const exporter = new OTLPTraceExporter({
    compression: CompressionAlgorithm.GZIP,
    ...options?.exporter,
  });
  provider.addSpanProcessor(new BatchSpanProcessor(exporter, options?.buffer));
  if (options?.debug) provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.register();

  const tracer = trace.getTracer('@allegoria/jest-reporter');
  return {provider, exporter, tracer};
}
