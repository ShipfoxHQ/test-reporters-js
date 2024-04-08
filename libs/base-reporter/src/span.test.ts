import {faker} from '@faker-js/faker';
import {describe, it, beforeEach, expect} from 'vitest';
import {genTestRun, genTestSuite, genNonExecutedTestCase, genCompletedTestCase} from '../test';
import {createTestRunSpan} from './span';
import {init} from './index';

interface TestSpan {
  name: string;
  startTime: [number, number];
  endTime: [number, number];
  duration: number;
  attributes: Record<string, unknown>;
}

describe('createTestRunSpan', () => {
  beforeEach(() => {
    init();
  });

  it('Non executed spans should take the start time of the run and have 0 duration', () => {
    const runStart = new Date('2024-03-25T17:35:17.000Z');
    const runEnd = new Date('2024-03-25T17:35:17.500Z');
    const testCase = genNonExecutedTestCase();
    const testSuite = genTestSuite({tests: [testCase]});
    const testRun = genTestRun({suites: [testSuite], start: runStart, end: runEnd});

    const spans = createTestRunSpan(testRun) as unknown as TestSpan[];
    const results = spans.filter((span) => span.attributes['allegoria.type'] === 'test.case');
    expect(results).toHaveLength(1);

    const result = results[0];
    const expectedTime = [runStart.getTime() / 1000, 0];
    expect(result.startTime).toEqual(expectedTime);
    expect(result.endTime).toEqual(expectedTime);
  });

  it('should set the root span time relatively to the baseTimestamp (in the past)', () => {
    init({baseTimeStamp: '2009-11-04T03:22:43.000Z'});
    const runStart = new Date('2024-03-25T17:35:17.000Z');
    const runEnd = new Date('2024-03-25T17:35:17.500Z');
    const testCase = genNonExecutedTestCase();
    const testSuite = genTestSuite({tests: [testCase]});
    const testRun = genTestRun({suites: [testSuite], start: runStart, end: runEnd});

    const spans = createTestRunSpan(testRun) as unknown as TestSpan[];
    const results = spans.filter((span) => span.attributes['allegoria.type'] === 'test.run');

    expect(results).toHaveLength(1);
    const result = results[0];
    const expectedStartTime = [new Date('2009-11-04T03:23:17.000Z').getTime() / 1000, 0];
    expect(result.startTime).toEqual(expectedStartTime);
    const expectedEndTime = [new Date('2009-11-04T03:23:17.000Z').getTime() / 1000, 500000000];
    expect(result.endTime).toEqual(expectedEndTime);
  });

  it('should set the root span time relatively to the baseTimestamp (in the future)', () => {
    init({baseTimeStamp: '2032-07-14T13:04:55.000Z'});
    const runStart = new Date('2024-03-25T17:35:17.000Z');
    const runEnd = new Date('2024-03-25T17:35:17.500Z');
    const testCase = genNonExecutedTestCase();
    const testSuite = genTestSuite({tests: [testCase]});
    const testRun = genTestRun({suites: [testSuite], start: runStart, end: runEnd});

    const spans = createTestRunSpan(testRun) as unknown as TestSpan[];
    const results = spans.filter((span) => span.attributes['allegoria.type'] === 'test.run');

    expect(results).toHaveLength(1);
    const result = results[0];
    const expectedStartTime = [new Date('2032-07-14T13:04:17.000Z').getTime() / 1000, 0];
    expect(result.startTime).toEqual(expectedStartTime);
    const expectedEndTime = [new Date('2032-07-14T13:04:17.000Z').getTime() / 1000, 500000000];
    expect(result.endTime).toEqual(expectedEndTime);
  });

  it('should set the test span time relatively to the baseTimestamp', () => {
    init({baseTimeStamp: '2009-11-04T03:22:43.000Z'});

    const testCase = genCompletedTestCase({
      start: new Date('2024-03-25T17:35:18.255Z'),
      end: new Date('2024-03-25T17:35:19.132Z'),
    });
    const testSuite = genTestSuite({tests: [testCase]});
    const testRun = genTestRun({
      suites: [testSuite],
      start: new Date('2024-03-25T17:35:17.000Z'),
      end: new Date('2024-03-25T17:35:19.500Z'),
    });

    const spans = createTestRunSpan(testRun) as unknown as TestSpan[];
    const results = spans.filter((span) => span.attributes['allegoria.type'] === 'test.case');
    expect(results).toHaveLength(1);
    const result = results[0];
    const expectedStartTime = [new Date('2009-11-04T03:23:18.000Z').getTime() / 1000, 255000000];
    expect(result.startTime).toEqual(expectedStartTime);
    const expectedEndTime = [new Date('2009-11-04T03:23:19.000Z').getTime() / 1000, 132000000];
    expect(result.endTime).toEqual(expectedEndTime);
  });

  it('propagates the test suite path to the test case', () => {
    const runStart = new Date('2024-03-25T17:35:17.000Z');
    const runEnd = new Date('2024-03-25T17:35:17.500Z');
    const path = faker.system.filePath();
    const testCase = genNonExecutedTestCase();
    const testSuite = genTestSuite({path, tests: [testCase]});
    const testRun = genTestRun({suites: [testSuite], start: runStart, end: runEnd});

    const spans = createTestRunSpan(testRun) as unknown as TestSpan[];
    const results = spans.filter((span) => span.attributes['allegoria.type'] === 'test.case');
    expect(results).toHaveLength(1);
    const result = results[0];
    expect(result.attributes['test.suite.path']).toBe(path);
  });
});
