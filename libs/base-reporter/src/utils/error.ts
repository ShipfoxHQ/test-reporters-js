import {getOptions} from './options';

export function handleError(error: unknown): void {
  const {succeedOnError} = getOptions();

  if (error instanceof AggregateError) {
    for (const err of error.errors) {
      handleError(err);
    }
    return;
  }
  console.error('Failed to push test results to Allegoria');
  console.error(error);
  if (!succeedOnError) process.exit(1);
}
