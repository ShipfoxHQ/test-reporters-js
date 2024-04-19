import {
  SEMRESATTRS_HOST_ARCH,
  HOSTARCHVALUES_X86,
  HOSTARCHVALUES_AMD64,
  HOSTARCHVALUES_ARM32,
  HOSTARCHVALUES_ARM64,
  SEMRESATTRS_OS_TYPE,
  OSTYPEVALUES_WINDOWS,
  OSTYPEVALUES_DARWIN,
  OSTYPEVALUES_LINUX,
} from '@opentelemetry/semantic-conventions';
import {hash16HexDigits, hash32HexDigits} from './utils';

const CI_PROVIDER = 'ci.provider';

const CI_PIPELINE_ID = 'ci.pipeline.id';
const CI_PIPELINE_NAME = 'ci.pipeline.name';
const CI_PIPELINE_URL = 'ci.pipeline.url';

const CI_PIPELINE_EXECUTION_ID = 'ci.pipeline.execution.id';
const CI_PIPELINE_EXECUTION_NAME = 'ci.pipeline.execution.name';
const CI_PIPELINE_EXECUTION_NUMBER = 'ci.pipeline.execution.number';
const CI_PIPELINE_EXECUTION_URL = 'ci.pipeline.execution.url';
const CI_PIPELINE_EXECUTION_ATTEMPT = 'ci.pipeline.execution.attempt';

const CI_JOB_ID = 'ci.job.id';
const CI_JOB_NAME = 'ci.job.name';

const CI_JOB_EXECUTION_ID = 'ci.job.execution.id';

const GIT_PROVIDER = 'git.provider';
const GIT_REPOSITORY_NAME = 'git.repository.name';
const GIT_REPOSITORY_URL = 'git.repository.url';
const GIT_REPOSITORY_ID = 'git.repository.id';
const GIT_REPOSITORY_PROVIDER_ID = 'git.repository.provider_id';

const GIT_REF = 'git.ref';
const GIT_REF_NAME = 'git.ref.name';
const GIT_REF_TYPE = 'git.ref.type';
const GIT_REF_BASE = 'git.ref.base';
const GIT_REF_HEAD = 'git.ref.head';

const GIT_COMMIT_SHA = 'git.commit.sha';

const GITHUB_RUNNER_ARCH_MAP = {
  X86: HOSTARCHVALUES_X86,
  X64: HOSTARCHVALUES_AMD64,
  ARM: HOSTARCHVALUES_ARM32,
  ARM64: HOSTARCHVALUES_ARM64,
};
type GithubRunnerArch = keyof typeof GITHUB_RUNNER_ARCH_MAP;

const GITHUB_OS_TYPE_MAP = {
  Linux: OSTYPEVALUES_LINUX,
  Windows: OSTYPEVALUES_WINDOWS,
  macOS: OSTYPEVALUES_DARWIN,
};
type GithubOsType = keyof typeof GITHUB_OS_TYPE_MAP;

interface CiMetadata {
  contextId?: string;
  spanAttributes: Record<string, string>;
  resourceAttributes: Record<string, string>;
}

export function getCiMetadata(): CiMetadata {
  if (process.env.GITHUB_ACTIONS) {
    // reporter is running on top of GitHub Actions
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
    } = process.env;

    const rawContextId = `github-${GITHUB_REPOSITORY_ID}-${GITHUB_WORKFLOW}-${GITHUB_RUN_NUMBER}-${GITHUB_RUN_ATTEMPT}`;
    const contextId = hash32HexDigits(rawContextId);

    const spanAttributes = {
      [CI_PROVIDER]: 'github',
      [CI_PIPELINE_ID]: hash32HexDigits(`github-${GITHUB_WORKFLOW}`),
      [CI_PIPELINE_NAME]: GITHUB_WORKFLOW,
      [CI_PIPELINE_URL]: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}/attempts/${GITHUB_RUN_ATTEMPT}`,
      [CI_PIPELINE_EXECUTION_ID]: hash16HexDigits(rawContextId),
      [CI_PIPELINE_EXECUTION_NAME]: GITHUB_ACTION,
      [CI_PIPELINE_EXECUTION_NUMBER]: GITHUB_RUN_NUMBER,
      [CI_PIPELINE_EXECUTION_URL]: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/workflows/${GITHUB_WORKFLOW}`,
      [CI_PIPELINE_EXECUTION_ATTEMPT]: GITHUB_RUN_ATTEMPT,
      [CI_JOB_ID]: hash32HexDigits(`github-${GITHUB_WORKFLOW}-${GITHUB_JOB}`),
      [CI_JOB_NAME]: GITHUB_JOB,
      [CI_JOB_EXECUTION_ID]: hash16HexDigits([rawContextId, 'GITHUB_JOB'].join('-')),
    };

    const resourceAttributes = {
      [SEMRESATTRS_HOST_ARCH]: GITHUB_RUNNER_ARCH_MAP[RUNNER_ARCH as GithubRunnerArch],
      [SEMRESATTRS_OS_TYPE]: GITHUB_OS_TYPE_MAP[RUNNER_OS as GithubOsType],
      [GIT_PROVIDER]: 'github',
      [GIT_REPOSITORY_NAME]: GITHUB_REPOSITORY,
      [GIT_REPOSITORY_URL]: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}`,
      [GIT_REPOSITORY_ID]: hash16HexDigits(`github-${GITHUB_REPOSITORY_ID}`),
      [GIT_REPOSITORY_PROVIDER_ID]: GITHUB_REPOSITORY_ID,
      [GIT_REF]: GITHUB_REF,
      [GIT_REF_NAME]: GITHUB_REF_NAME,
      [GIT_REF_TYPE]: GITHUB_REF_TYPE,
      [GIT_REF_BASE]: GITHUB_BASE_REF,
      [GIT_REF_HEAD]: GITHUB_HEAD_REF,
      [GIT_COMMIT_SHA]: GITHUB_SHA,
    };

    return {
      contextId,
      spanAttributes: removeNullUndefined(spanAttributes),
      resourceAttributes: removeNullUndefined(resourceAttributes),
    };
  }

  return {
    contextId: undefined,
    spanAttributes: {},
    resourceAttributes: {},
  };
}

function removeNullUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
