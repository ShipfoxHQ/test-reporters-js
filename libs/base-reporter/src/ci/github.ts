import {cleanEnv, str, num} from 'envalid';
import {hash16HexDigits, hash32HexDigits} from '../utils';
import {type CiAttributes, type HostArch, type OSType} from './utils';

const GITHUB_RUNNER_ARCH_MAP: Record<string, HostArch> = {
  X86: 'x86',
  X64: 'x86',
  ARM: 'arm32',
  ARM64: 'arm64',
};

const GITHUB_OS_TYPE_MAP: Record<string, OSType> = {
  Linux: 'linux',
  Windows: 'windows',
  macOS: 'darwin',
};

const githubEnvSchema = {
  GITHUB_ACTION: str(),
  GITHUB_BASE_REF: str(),
  GITHUB_HEAD_REF: str(),
  GITHUB_JOB: str(),
  GITHUB_REF: str(),
  GITHUB_REF_NAME: str(),
  GITHUB_REF_TYPE: str(),
  GITHUB_REPOSITORY: str(),
  GITHUB_REPOSITORY_ID: str(),
  GITHUB_RUN_ATTEMPT: num(),
  GITHUB_RUN_ID: str(),
  GITHUB_RUN_NUMBER: num(),
  GITHUB_SERVER_URL: str(),
  GITHUB_SHA: str(),
  GITHUB_WORKFLOW: str(),
  RUNNER_ARCH: str(),
  RUNNER_OS: str(),
};

export function getGitHubActionsAttributes(): CiAttributes {
  const {
    GITHUB_ACTION,
    GITHUB_BASE_REF,
    GITHUB_HEAD_REF,
    GITHUB_JOB,
    GITHUB_REF,
    GITHUB_REF_NAME,
    GITHUB_REF_TYPE,
    GITHUB_REPOSITORY,
    GITHUB_REPOSITORY_ID,
    GITHUB_RUN_ATTEMPT,
    GITHUB_RUN_ID,
    GITHUB_RUN_NUMBER,
    GITHUB_SERVER_URL,
    GITHUB_SHA,
    GITHUB_WORKFLOW,
    RUNNER_ARCH,
    RUNNER_OS,
  } = cleanEnv(process.env, githubEnvSchema);

  const rawContextId = `github-${GITHUB_REPOSITORY_ID}-${GITHUB_WORKFLOW}-${GITHUB_RUN_NUMBER}-${GITHUB_RUN_ATTEMPT}`;
  const rawResourceId = `github-${GITHUB_REPOSITORY_ID}-${GITHUB_WORKFLOW}`;

  return {
    'context.id': hash32HexDigits(rawContextId),
    'ci.provider': 'github',
    'ci.pipeline.id': hash32HexDigits(rawResourceId),
    'ci.pipeline.name': GITHUB_WORKFLOW,
    'ci.pipeline.url': `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/workflows/${GITHUB_WORKFLOW}`,
    'ci.pipeline.execution.id': hash16HexDigits(rawContextId),
    'ci.pipeline.execution.name': GITHUB_ACTION,
    'ci.pipeline.execution.number': GITHUB_RUN_NUMBER,
    'ci.pipeline.execution.url': `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`,
    'ci.pipeline.execution.attempt': GITHUB_RUN_ATTEMPT,
    'ci.job.id': hash32HexDigits(`${rawResourceId}-${GITHUB_JOB}`),
    'ci.job.name': GITHUB_JOB,
    'ci.job.execution.id': hash16HexDigits(`${rawContextId}-${GITHUB_JOB}`),
    'host.arch': GITHUB_RUNNER_ARCH_MAP[RUNNER_ARCH],
    'os.type': GITHUB_OS_TYPE_MAP[RUNNER_OS],
    'git.provider': 'github',
    'git.repository.name': GITHUB_REPOSITORY,
    'git.repository.url': `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}`,
    'git.repository.id': hash16HexDigits(`github-${GITHUB_REPOSITORY_ID}`),
    'git.repository.provider_id': GITHUB_REPOSITORY_ID,
    'git.ref': GITHUB_REF,
    'git.ref.name': GITHUB_REF_NAME,
    'git.ref.type': GITHUB_REF_TYPE,
    'git.ref.base': GITHUB_BASE_REF,
    'git.ref.head': GITHUB_HEAD_REF,
    'git.commit.sha': GITHUB_SHA,
  };
}
