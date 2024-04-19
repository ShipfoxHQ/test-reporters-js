import {XXHash128, XXHash3} from 'xxhash-addon';

/** Returns a hex string encoded 16 byte hash  */
export function hash16(input: string) {
  const buffer = Buffer.from(input, 'utf-8');
  const hash = XXHash3.hash(buffer);
  return hash.toString('hex');
}

/** Returns a hex string encoded 32 byte hash  */
export function hash32(input: string) {
  const buffer = Buffer.from(input, 'utf-8');
  const hash = XXHash128.hash(buffer);
  return hash.toString('hex');
}
