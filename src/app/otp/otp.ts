import { base32Decode } from '@ctrl/ts-base32';
import { uintDecode } from '../utils';

/**
 * Type from: https://github.com/scttcper/ts-base32/blob/3de4744e706f5e09baca25c1063d447a324b7fde/src/index.ts#L5
 */
type Variant = 'RFC3548' | 'RFC4648' | 'RFC4648-HEX' | 'Crockford';

/**
 * Create a CryptoKey based on the supplied arguments.
 *
 * @param { string } key A base 32 encoded crytpographic key value (by default using RFC4648).
 * @param { Variant } variant The default variant does not include several digitsso an alternative can be specified if required.
 * @returns { Promise<CryptoKey> } A Promise containg the CryptoKey instance.
 */
const createCryptoKey = async (
  key: string,
  variant: Variant = 'RFC4648',
): Promise<CryptoKey> =>
  await crypto.subtle.importKey(
    'raw',
    base32Decode(key, variant),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );

/**
 * Extracts a 'dynamic' four bytes from the supplied hash and converts that to a single integer.
 *
 * This is really a private implementation detail but is being exported as
 * a utility testable utility to aid understanding of the process.
 *
 * @param { Uint8Array } hash.
 * @returns { number } An integer.
 */
const truncate = (hash: Uint8Array): number => {
  // Extract the four least significant bits from the hash, which is by
  // definition between zero (0000) and 15 (1111).
  const offset = hash[hash.length - 1] & 15;

  // Extract four bytes/32 bits from the offset.
  const value =
    (hash[offset] << 24) |
    (hash[offset + 1] << 16) |
    (hash[offset + 2] << 8) |
    hash[offset + 3];

  // Return the least significant 31 bits. This removes bit 32 to avoid
  // ambiguity with signed/unsigned integers, because the most significant
  // bit is usually 0 for a positive, and 1 for a negative number, but
  // there can be issues with that.
  return value & 0x7fffffff;
};

/**
 * Takes a truncated HMAC code number and returns the modulo of that to return the requested number of digits.
 *
 * @param { number } value An integer.
 * @param { number } digits How many digits should each token have?
 * @returns { string } The final TOTP value - of the length specified by digits.
 */
const toToken = (value: number, digits = 6): string => {
  const otp = value % 10 ** digits;
  return otp.toString().padStart(digits, '0');
};

/**
 * Returns the number of timesteps (of size 'period') that will have occured at the specified time.
 *
 * @param { number } timestamp The number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
 * @returns { number } The number timesteps to have occured before the inpuit timestamp.
 */
const toCounter = (timestamp: number, period: number): number => {
  const timestampInSecs = Math.floor(timestamp / 1000);
  return Math.floor(timestampInSecs / period);
};

/**
 * Generates the [Time-based one-time password](https://en.wikipedia.org/wiki/Time-based_one-time_password) value.
 *
 * References:
 * - A detailed technical explanation of TOTP: https://www.hendrik-erz.de/post/understanding-totp-two-factor-authentication-eli5
 *   (Several of the comments are taken from there for clarity).
 * - MFA QR code generator project: https://stefansundin.github.io/2fa-qr/
 * - Also links to URI Key format explantion here: https://github.com/google/google-authenticator/wiki/Key-Uri-Format
 *
 * @param { number } utcNow The current time (T) to use in the [Algorithm](https://en.wikipedia.org/wiki/Time-based_one-time_password#Algorithm).
 * This is expected to be the return value from `Date.now()` e.g. the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC).
 * @param { string } secret A base 32 encoded crytpographic key value (by default using RFC4648).
 * @param { number } digits How many digits should each token have?
 * @returns { string } The final TOTP value - of the length specified by digits.
 */
const generateTotp = async (
  utcNow: number,
  secret: string,
  period = 30,
  digits = 6,
): Promise<string> => {
  const counter = toCounter(utcNow, period);
  const data = uintDecode(counter);
  const cryptoKey = await createCryptoKey(secret);
  const hash = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const truncatedHashValue = truncate(new Uint8Array(hash));
  return toToken(truncatedHashValue, digits);
};

export { generateTotp, truncate };
