import {isEven, isOdd} from './index'
import {describe, it, expect} from 'vitest'

describe('isEven', () => {
  it('should return true if the number is even', () => {
    expect(isEven(2)).toBe(true);
  });

  it('should return false if the number is odd', () => {
    expect(isEven(3)).toBe(false);
  });

  it('should throw an error if the number is not a number', () => {
    expect(() => isEven('a')).toThrow();
  });
});

describe('isOdd', () => {
  it('should return true if the number is odd', () => {
    expect(isOdd(3)).toBe(true);
  });

  it('should return false if the number is even', () => {
    expect(isOdd(2)).toBe(false);
  });

  it('should throw an error if the number is not a number', () => {
    expect(() => isOdd('a')).toThrow();
  });

  it.skip('should skip this test', () => {
    expect(1).toBe(1);
  });
});