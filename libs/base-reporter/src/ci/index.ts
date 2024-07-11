import {getGitHubActionsAttributes} from './github';
import {type CiAttributes, removeNullUndefined} from './utils';

export function getCiAttributes() {
  return removeNullUndefined(_getCiAttributes());
}

function _getCiAttributes(): CiAttributes | Record<string, never> {
  if (process.env.GITHUB_ACTIONS) return getGitHubActionsAttributes();
  return {};
}
