import type {OTLPExporterNodeConfigBase} from '@opentelemetry/otlp-exporter-base';
import type {BufferConfig} from '@opentelemetry/sdk-trace-base';
export interface AllegoriaReporterOptions {
  exporter?: OTLPExporterNodeConfigBase;
  buffer?: BufferConfig;
  debug?: boolean;
  /** By default failing to export test results will fail the test run, enable this option to make it succeed */
  succeedOnExportFailure?: boolean;
}
