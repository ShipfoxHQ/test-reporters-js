import {trace, type Tracer} from '@opentelemetry/api';
import {setGlobalErrorHandler} from '@opentelemetry/core';
import {OTLPTraceExporter as HttpOTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http';
import {OTLPTraceExporter as ProtoOTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-proto';
import {CompressionAlgorithm} from '@opentelemetry/otlp-exporter-base';
import type {OTLPExporterNodeConfigBase} from '@opentelemetry/otlp-exporter-base';
import {Resource} from '@opentelemetry/resources';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  BatchSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {SEMRESATTRS_PROCESS_RUNTIME_NAME} from '@opentelemetry/semantic-conventions';
import {collectCIMetadata} from './ci';
import {getOptions} from './utils';

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

let tracer: Tracer | undefined;
let provider: BasicTracerProvider | undefined;

export function initTracing() {
  const options = getOptions();
  succeedOnExportFailure = options?.succeedOnExportFailure ?? false;
  setGlobalErrorHandler(onError);
  const ciMetadata = collectCIMetadata();
  provider = new BasicTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_PROCESS_RUNTIME_NAME]: 'jest',
      ...ciMetadata,
    }),
  });
  const exporterConfig: OTLPExporterNodeConfigBase = {
    compression: CompressionAlgorithm.GZIP,
    ...options?.exporter,
  };
  const exporter = options?.useHttp
    ? new HttpOTLPTraceExporter(exporterConfig)
    : new ProtoOTLPTraceExporter(exporterConfig);
  provider.addSpanProcessor(new BatchSpanProcessor(exporter, options?.buffer));
  if (options?.debug) provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.register();

  tracer = trace.getTracer('@allegoria/jest-reporter');
  return {provider, exporter, tracer};
}

export function getTracer(): Tracer {
  if (!tracer) throw new Error('Tracing was not initialized');
  return tracer;
}

export async function shutdown() {
  try {
    await provider?.shutdown();
  } catch (error) {
    onError(error);
  }
}
