import type {Context} from '@opentelemetry/api';
import {differenceInMinutes, addMinutes} from 'date-fns';
import type {TestCase, TestSuite, TestRun} from '../span';
import {getOptions} from './options';

export const TEST_RUN_START_KEY = Symbol.for('test.run.start');

type DateTime = number | Date;

export function getTiming(
  span: TestCase | TestSuite | TestRun,
  context: Context,
): {startTime: DateTime; endTime: DateTime} {
  const realTiming = getRealTiming(span, context);
  const options = getOptions();
  if (!options.baseTimeStamp) return realTiming;
  // For root spans their start time would be the base timestamp
  const testRunStart = getTestRunStartTime(context) ?? realTiming.startTime;
  const baseTime = new Date(options.baseTimeStamp).getTime();
  const timeDelta = differenceInMinutes(baseTime, testRunStart);
  return {
    startTime: addMinutes(realTiming.startTime, timeDelta),
    endTime: addMinutes(realTiming.endTime, timeDelta),
  };
}

function getTestRunStartTime(context: Context): DateTime | undefined {
  return context.getValue(TEST_RUN_START_KEY) as DateTime | undefined;
}

function getRealTiming(
  span: TestCase | TestSuite | TestRun,
  context: Context,
): {startTime: DateTime; endTime: DateTime} {
  if ('start' in span) {
    return {
      startTime: span.start as DateTime,
      endTime: span.end as DateTime,
    };
  }
  const start = getTestRunStartTime(context);
  if (!start)
    throw new Error(`Could not get non executed test start time from context [${span.name}]`);
  return {
    startTime: start,
    endTime: start,
  };
}
