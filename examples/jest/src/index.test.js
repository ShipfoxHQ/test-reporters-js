const {isEven, isOdd} = require('./index');

describe('isEven', () => {
  it('should return true if the number is even', () => {
    expect(isEven(2)).toBe(true);
  });

  it('should return false if the number is odd', () => {
    expect(isEven(3)).toBe(false);
  });
});

describe('isOdd', () => {
  it('should return true if the number is odd', () => {
    expect(isOdd(3)).toBe(true);
  });

  it('should return false if the number is even', () => {
    expect(isOdd(2)).toBe(false);
  });

  it.skip('should skip this test', () => {
    expect(1).toBe(1);
  });
});

describe('nested suite', () => {
  describe('nested nested suite', () => {
    it('should succeed', () => {
      expect(true).toBe(true);
    });
  });

  describe.skip('skipped nested suite', () => {
    it('should not run as the suite is skipped', () => {
      expect(false).toBe(true);
    });
  });
});

describe('failing tests', () => {
  it('should fail', () => {
    expect(true).toBe(false);
  });

  it.failing('should succeed as it is a failing test', () => {
    expect(true).toBe(false);
  });
});

describe.skip('skipped suite', () => {
  it('should not run as the suite is skipped', () => {
    expect(false).toBe(true);
  });
});

it('runs a first level test', () => {
  expect(true).toBe(true);
});

it.todo('is a todo test');
