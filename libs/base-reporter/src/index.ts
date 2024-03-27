export * from './span';
export * from './tracing';
export type {BaseOptions} from './utils';

import {initTracing} from './tracing';
import {setOptions, type BaseOptions} from './utils';

export function init(options?: BaseOptions) {
  setOptions(options);
  initTracing();
}
