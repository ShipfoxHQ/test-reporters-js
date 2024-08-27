import type {CompletedTestCase, NonExecutedTestCase} from '@shipfox/test-reporter-base';
import {describe, it, expect, type TaskState, Vitest} from 'vitest';
import {genFile, genSuite, genTest} from '../test';
import {createDataFromFile, createDataFromTask} from './result';

describe('createDataFromFile', () => {
  describe('File', () => {
    const context = {config: {root: '/Users/john-doe/my-repo'}} as Vitest;
    it('should calculate duration for a file', () => {
      const file = genFile({result: {startTime: 100, duration: 50, state: 'pass'}});
      const data = createDataFromFile(file, context);

      expect(data.start).toBe(100);
      expect(data.end).toBe(150);
    });

    it('should calculate the correct path for a file', () => {
      const file = genFile({
        filepath: '/Users/john-doe/my-repo/src/index.test.js',
      });
      const data = createDataFromFile(file, context);

      expect(data.path).toBe('src/index.test.js');
    });
  });

  describe('Test', () => {
    it('should return an empty list if a task is a todo', () => {
      const suite = genSuite({mode: 'todo', tasks: [genSuite(), genSuite()]});
      const data = createDataFromTask(suite);
      expect(data).toEqual([]);
    });

    it.each([
      ['pass', 'success'],
      ['fail', 'failure'],
    ])('should return a completed test [%s]', (sourceState: string, destState: string) => {
      const suite = genSuite();
      suite.tasks.push(
        genTest({
          suite,
          result: {state: sourceState as TaskState, startTime: 100, duration: 50},
          retry: 2,
        }),
      );

      const data = createDataFromTask(suite);
      expect(data.length).toBe(1);

      const testCase = data[0] as CompletedTestCase;
      expect(testCase.status).toBe(destState);
      expect(testCase.start).toBe(100);
      expect(testCase.end).toBe(150);
      expect(testCase.retries).toBe(2);
    });

    it('should return a skipped tests', () => {
      const suite = genSuite();
      suite.tasks.push(
        genTest({
          mode: 'skip',
          suite,
          result: undefined,
        }),
      );

      const data = createDataFromTask(suite);
      expect(data.length).toBe(1);
      const testCase = data[0] as NonExecutedTestCase;
      expect(testCase.status).toBe('skipped');
    });

    it('should propagate ancestors', () => {
      const suite1 = genSuite({name: 'root'});
      const suite2 = genSuite({name: 'middle', suite: suite1});
      suite1.tasks.push(suite2);
      const test = genTest({name: 'test', suite: suite2});
      suite2.tasks.push(test);

      const data = createDataFromTask(suite1);

      expect(data.length).toBe(1);
      expect(data[0].title).toBe('test');
      expect(data[0].titlePath).toEqual(['root', 'middle', 'test']);
    });

    it('should consider a test skipped if one of his parents is skipped', () => {
      const suite1 = genSuite({mode: 'skip'});
      const suite2 = genSuite({suite: suite1});
      suite1.tasks.push(suite2);
      const test = genTest({suite: suite2});
      suite2.tasks.push(test);

      const data = createDataFromTask(suite1);

      expect(data.length).toBe(1);
      expect(data[0].status).toBe('skipped');
    });
  });
});
