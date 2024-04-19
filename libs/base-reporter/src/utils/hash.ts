import {XXHash128, XXHash3} from 'xxhash-addon';

/** Returns a 16 char hex encoded hash  */
export function hash16HexDigits(input: string) {
  const buffer = Buffer.from(input, 'utf-8');
  const hash = XXHash3.hash(buffer);
  return hash.toString('hex');
}

/** Returns a 16 char hex encoded hash  */
export function hash32HexDigits(input: string) {
  const buffer = Buffer.from(input, 'utf-8');
  const hash = XXHash128.hash(buffer);
  return hash.toString('hex');
}
