export type HostArch = 'x86' | 'amd64' | 'arm32' | 'arm64';
export type OSType = 'windows' | 'darwin' | 'linux';

export interface CiAttributes {
  'context.id': string;
  'ci.provider': 'github';
  'ci.pipeline.id': string;
  'ci.pipeline.name': string;
  'ci.pipeline.url': string;
  'ci.pipeline.execution.id': string;
  'ci.pipeline.execution.name': string;
  'ci.pipeline.execution.number': number;
  'ci.pipeline.execution.url': string;
  'ci.pipeline.execution.attempt': number;
  'ci.job.id': string;
  'ci.job.name': string;
  'ci.job.execution.id': string;
  'git.provider': 'github';
  'git.repository.name': string;
  'git.repository.id': string;
  'git.repository.provider_id': string;
  'git.repository.url': string;
  'git.ref': string;
  'git.ref.name': string;
  'git.ref.type': string;
  'git.ref.base': string;
  'git.ref.head': string;
  'git.commit.sha': string;
  'git.commit.author.name'?: string;
  'git.commit.author.email'?: string;
  'host.arch': HostArch;
  'os.type': OSType;
}

export function removeNullUndefined<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
