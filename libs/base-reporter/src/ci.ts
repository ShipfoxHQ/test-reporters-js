const CI_PROVIDER = 'ci.provider';

const CI_PIPELINE_RUN_ID = 'ci.pipeline.run.id';
const CI_PIPELINE_NAME = 'ci.pipeline.name';
const CI_PIPELINE_RUN_NUMBER = 'ci.pipeline.run.number';
const CI_PIPELINE_RUN_URL = 'ci.pipeline.run.url';
const CI_JOB_NAME = 'ci.job.name';
const CI_JOB_URL = 'ci.job.url';

const GIT_COMMIT_SHA = 'git.sha';
const GIT_REPOSITORY_URL = 'git.repository.url';
const GIT_REF = 'git.ref';

export function collectCIMetadata() {
  if (process.env.GITHUB_ACTIONS) {
    // reporter is running on top of GitHub Actions
    const {
      GITHUB_ACTION,
      GITHUB_ACTION_REPOSITORY,
      GITHUB_ACTOR,
      GITHUB_ACTOR_ID,
      GITHUB_BASE_REF,
      GITHUB_EVENT_NAME,
      GITHUB_HEAD_REF,
      GITHUB_JOB,
      GITHUB_REF,
      GITHUB_REF_NAME,
      GITHUB_REF_TYPE,
      GITHUB_REPOSITORY,
      GITHUB_REPOSITORY_ID,
      GITHUB_REPOSITORY_OWNER,
      GITHUB_REPOSITORY_OWNER_ID,
      GITHUB_RETENTION_DAYS,
      GITHUB_RUN_ATTEMPT,
      GITHUB_RUN_ID,
      GITHUB_RUN_NUMBER,
      GITHUB_SERVER_URL,
      GITHUB_SHA,
      GITHUB_TRIGGERING_ACTOR,
      GITHUB_WORKFLOW,
      GITHUB_WORKFLOW_REF,
      GITHUB_WORKFLOW_SHA,
      RUNNER_ARCH,
      RUNNER_DEBUG,
      RUNNER_NAME,
      RUNNER_OS,
    } = process.env;

    const metadata = {
      [CI_PROVIDER]: 'github',
      [CI_PIPELINE_RUN_ID]: `${GITHUB_ACTION}-${GITHUB_RUN_NUMBER}-${GITHUB_RUN_ATTEMPT}`,
      [CI_PIPELINE_NAME]: GITHUB_WORKFLOW,
      [CI_PIPELINE_RUN_NUMBER]: GITHUB_RUN_NUMBER,
      [CI_PIPELINE_RUN_URL]: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}/attempts/${GITHUB_RUN_ATTEMPT}`,
      [CI_JOB_NAME]: GITHUB_JOB,
      [CI_JOB_URL]: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}/checks`,
      [GIT_COMMIT_SHA]: GITHUB_SHA,
      [GIT_REPOSITORY_URL]: `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}.git`,
      [GIT_REF]: GITHUB_REF,
      'github.action': GITHUB_ACTION,
      'github.action.repository': GITHUB_ACTION_REPOSITORY,
      'github.actor': GITHUB_ACTOR,
      'github.actor.id': GITHUB_ACTOR_ID,
      'github.base.ref': GITHUB_BASE_REF,
      'github.event.name': GITHUB_EVENT_NAME,
      'github.head.ref': GITHUB_HEAD_REF,
      'github.ref': GITHUB_REF,
      'github.ref.name': GITHUB_REF_NAME,
      'github.ref.type': GITHUB_REF_TYPE,
      'github.repository': GITHUB_REPOSITORY,
      'github.repository.id': GITHUB_REPOSITORY_ID,
      'github.repository.owner': GITHUB_REPOSITORY_OWNER,
      'github.repository.owner.id': GITHUB_REPOSITORY_OWNER_ID,
      'github.retention.days': GITHUB_RETENTION_DAYS,
      'github.run.attempt': GITHUB_RUN_ATTEMPT,
      'github.run.id': GITHUB_RUN_ID,
      'github.triggering.actor': GITHUB_TRIGGERING_ACTOR,
      'github.workflow.ref': GITHUB_WORKFLOW_REF,
      'github.workflow.sha': GITHUB_WORKFLOW_SHA,
      'github.runner.arch': RUNNER_ARCH,
      'github.runner.debug': RUNNER_DEBUG,
      'github.runner.name': RUNNER_NAME,
      'github.runner.os': RUNNER_OS,
    };
    return removeNullUndefined(metadata);
  }
}

function removeNullUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!value !== null) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
