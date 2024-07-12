import {exec} from 'node:child_process';

export function getGitOrigin(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec('git config --get remote.origin.url', (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });
}

export function getGitRoot(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    exec('git rev-parse --show-toplevel', (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });
}

const gitOriginSshRegex = /^git@([^:]+):(.+)\.git$/;
const gitOriginHttpsRegex = /^https:\/\/([^\\/]+)\/(.+)\.git$/;

let _repositoryUrl: string | undefined;

export async function getRepositoryUrl(): Promise<string> {
  if (!_repositoryUrl) _repositoryUrl = await _getRepositoryUrl();
  return _repositoryUrl;
}

async function _getRepositoryUrl(): Promise<string> {
  const origin = await getGitOrigin();
  const sshOriginMatch = origin.match(gitOriginSshRegex);
  const httpsOriginMatch = origin.match(gitOriginHttpsRegex);
  if (sshOriginMatch) {
    return `https://${sshOriginMatch[1]}/${sshOriginMatch[2]}`;
  } else if (httpsOriginMatch) {
    return `https://${httpsOriginMatch[1]}/${httpsOriginMatch[2]}`;
  }
  throw new Error('Failed to determine repository URL');
}
