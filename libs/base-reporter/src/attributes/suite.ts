import {randomBytes} from 'node:crypto';
import type {Attributes} from '@opentelemetry/api';
import type {TestSuite, Parent} from '../types';
import {hash32HexDigits} from '../utils';
import {getStatusAttributes} from './status';

export function getSuiteAttributes(suite: TestSuite, parent: Parent) {
  const rawResourceId = `${parent.rawResourceId}-${suite.path}`;

  const propagatedAttributes: Attributes = {
    ...parent.propagatedAttributes,
    'test.suite.id': hash32HexDigits(rawResourceId),
    'test.suite.path': suite.path,
    'test.suite.execution.id': randomBytes(8).toString('hex'),
  };

  const statusAttributes = getStatusAttributes(suite);

  const attributes: Attributes = {
    ...propagatedAttributes,
    ...statusAttributes,
    'execution.type': 'test.suite',
  };

  return {
    rawResourceId,
    propagatedAttributes,
    statusAttributes,
    attributes,
  };
}
