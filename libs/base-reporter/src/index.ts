export * from './span';
export * from './tracing';
export {getPackageVersion, getVersionFromPackageJson} from './utils';
export {type BaseOptions, handleError} from './utils';

import {getOidcToken} from './oidc';
import {initTracing, type RuntimeAttributes} from './tracing';
import {setOptions as _setOptions, handleError, type BaseOptions} from './utils';

export async function setOptions(options?: BaseOptions) {
  _setOptions(options);
}

export async function init(attributes: RuntimeAttributes) {
  try {
    const {token} = await getOidcToken();
    initTracing(token, attributes);
  } catch (error) {
    handleError(error);
  }
}
