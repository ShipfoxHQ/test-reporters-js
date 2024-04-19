export * from './span';
export * from './tracing';
export {getPackageVersion, getVersionFromPackageJson} from './utils';
export type {BaseOptions} from './utils';

import {initTracing, type RunnerAttributes} from './tracing';
import {setOptions, type BaseOptions} from './utils';

export function init(options: BaseOptions & RunnerAttributes) {
  setOptions(options);
  initTracing(options);
}
