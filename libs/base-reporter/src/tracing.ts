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
  type Tracer,
} from '@opentelemetry/sdk-trace-base';
import {
  SEMRESATTRS_PROCESS_RUNTIME_NAME,
  SEMRESATTRS_PROCESS_RUNTIME_VERSION,
} from '@opentelemetry/semantic-conventions';
import {getCiAttributes} from './ci';
import {getOptions, handleError} from './utils';

let tracer: Tracer | undefined;
let provider: BasicTracerProvider | undefined;

export interface RuntimeAttributes {
  runner: {name: string; version?: string};
  reporter: {name: string; version?: string};
}

export function initTracing(oidcToken: string, attributes: RuntimeAttributes) {
  tracer = undefined;
  provider = undefined;
  const options = getOptions();
  setGlobalErrorHandler(handleError);
  const resourceAttributes = getCiAttributes();

  provider = new BasicTracerProvider({
    resource: new Resource({
      'test.language': 'javascript',
      [SEMRESATTRS_PROCESS_RUNTIME_NAME]: 'nodejs',
      [SEMRESATTRS_PROCESS_RUNTIME_VERSION]: process.versions.node,
      'test_runner.name': attributes.runner.name,
      'test_runner.version': attributes.runner.version,
      'test_runner.reporter.name': attributes.reporter.name,
      'test_runner.reporter.version': attributes.reporter.version,
      ...resourceAttributes,
    }),
  });
  const exporterConfig: OTLPExporterNodeConfigBase = {
    compression: CompressionAlgorithm.GZIP,
    url: 'https://otlp.allegoria.io:4318/v1/traces',
    headers: {
      Authorization: `Bearer ${oidcToken}`,
    },
    ...options?.exporter,
  };
  const exporter = options?.useHttp
    ? new HttpOTLPTraceExporter(exporterConfig)
    : new ProtoOTLPTraceExporter(exporterConfig);
  provider.addSpanProcessor(new BatchSpanProcessor(exporter, options?.buffer));
  if (options?.debug) provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  provider.register();
  tracer = provider.getTracer('allegoria');

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
    handleError(error);
  }
}
