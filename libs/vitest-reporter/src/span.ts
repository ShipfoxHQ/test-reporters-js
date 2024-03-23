import type {TestRun, TestSuite, TestCase} from '@allegoria/test-reporter-base';
import type {File} from 'vitest'

export function createTestSuite(file: File): TestSuite {
  const mode = file.mode;
  console.log(file.name)
  console.log(file.result?.startTime)
  if(!file.result) throw new Error(`Test result not found ${file.filepath}`)
  if (!file.result.startTime) throw new Error(`Test start time not found ${file.filepath}`)
  if (!file.result.duration) throw new Error(`Test duration not found ${file.filepath}`)
  return {
    path: file.filepath,
    start: file.result.startTime,
    end: file.result.startTime + file.result.duration,
    tests: [],
  }
}