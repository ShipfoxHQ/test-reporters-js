import type {OTLPExporterNodeConfigBase} from '@opentelemetry/otlp-exporter-base';
import type {BufferConfig} from '@opentelemetry/sdk-trace-base';

export interface BaseOptions {
  useHttp?: boolean;
  disableCompression?: boolean;
  exporter?: OTLPExporterNodeConfigBase;
  buffer?: BufferConfig;
  debug?: boolean;
  /** Setting this will cause the reported data to behave as if the test run was done on the given date */
  baseTimeStamp?: string;
  /** By default failing to export test results will fail the test run, enable this option to make it succeed */
  succeedOnError?: boolean;
  /** Key to authenticate with the Shipfox API */
  apiKey?: string;
  /** Override the Shipfox API URL */
  apiUrl?: string;
}

let _options: BaseOptions = {};

export function setOptions(options: BaseOptions = {}): void {
  _options = mergeOptionsWithEnv(options);
}

export function getOptions(): BaseOptions {
  return _options;
}

function mergeOptionsWithEnv(options: BaseOptions): BaseOptions {
  const envOptionsStr = process.env.ALLEGORIA_TEST_REPORTER_OPTIONS;
  if (!envOptionsStr) return options;
  try {
    const envOptions = JSON.parse(envOptionsStr) as BaseOptions;
    return {
      ...options,
      ...envOptions,
      exporter: {
        ...options?.exporter,
        ...envOptions?.exporter,
      },
      buffer: {
        ...options?.buffer,
        ...envOptions?.buffer,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse options: ${error}`);
  }
}
