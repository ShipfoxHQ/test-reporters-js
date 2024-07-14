import {randomBytes} from 'node:crypto';
import type {Attributes} from '@opentelemetry/api';
import type {TestCase, Parent} from '../types';
import {hash32HexDigits} from '../utils';
import {getStatusAttributes} from './status';

export function getCaseAttributes(test: TestCase, parent: Parent) {
  const rawResourceId = `${parent.rawResourceId}-${test.titlePath.join('-')}`;

  const propagatedAttributes: Attributes = {
    ...parent.propagatedAttributes,
    'test.case.id': hash32HexDigits(rawResourceId),
    'test.case.title': test.title,
    'test.case.title_path': test.titlePath,
    'test.case.execution.id': randomBytes(8).toString('hex'),
  };

  if (test.status === 'success' || test.status === 'failure') {
    propagatedAttributes['test.case.execution.retry_count'] = test.retries;
  }

  const statusAttributes = getStatusAttributes(test);

  const attributes: Attributes = {
    ...propagatedAttributes,
    ...statusAttributes,
    'execution.type': 'test.case',
  };

  return {
    rawResourceId,
    propagatedAttributes,
    statusAttributes,
    attributes,
  };
}
