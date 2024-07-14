import {randomBytes} from 'node:crypto';
import {relative} from 'node:path';
import type {Attributes} from '@opentelemetry/api';
import type {TestRun} from '../types';
import {hash32HexDigits, getRepositoryUrl, getGitRoot} from '../utils';
import {getStatusAttributes} from './status';

export async function getRunAttributes(run: TestRun) {
  const repositoryUrl = await getRepositoryUrl();
  const repositoryRoot = await getGitRoot();
  const relativeConfigPath = relative(repositoryRoot, run.configPath);
  const rawResourceId = `${repositoryUrl}-${relativeConfigPath}`;

  const propagatedAttributes: Attributes = {
    'test.run.id': hash32HexDigits(rawResourceId),
    'test.run.config_path': relativeConfigPath,
    'test.run.execution.id': randomBytes(8).toString('hex'),
  };

  const statusAttributes = getStatusAttributes(run);

  const attributes: Attributes = {
    ...propagatedAttributes,
    ...statusAttributes,
    'execution.type': 'test.run',
  };

  return {
    rawResourceId,
    propagatedAttributes,
    statusAttributes,
    attributes,
  };
}
