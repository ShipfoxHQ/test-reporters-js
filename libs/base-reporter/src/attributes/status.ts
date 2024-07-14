import type {TestCase, TestRun, TestSuite, ExecutionStatus} from '../types';

export const PROPAGATED_ATTRIBUTES_KEY = Symbol('propagatedAttributes');
export const RAW_RESOURCE_ID_KEY = Symbol('rawResourceId');
export const RAW_EXECUTION_ID_KEY = Symbol('rawExecutionId');

export type Status = 'success' | 'failed' | 'neutral';
export type DetailedStatus =
  | 'success'
  | 'failed'
  | 'timed_out'
  | 'neutral'
  | 'skipped'
  | 'cancelled';
export type StatusAttributes = {
  'execution.status': Status;
  'execution.detailed_status': DetailedStatus;
};

const statusMap: Record<ExecutionStatus, StatusAttributes> = {
  success: {'execution.status': 'success', 'execution.detailed_status': 'success'},
  failure: {'execution.status': 'failed', 'execution.detailed_status': 'failed'},
  skipped: {'execution.status': 'neutral', 'execution.detailed_status': 'skipped'},
};

export function getStatusAttributes(item: TestRun | TestSuite | TestCase): StatusAttributes {
  const result = statusMap[item.status];
  if (!result) throw new Error(`Unknown status: ${item.status}`);
  return result;
}
