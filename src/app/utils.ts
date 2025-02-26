/**
 * Converts an integer to an Uint8Array.
 *
 * Slightly modified version of the code found here:
 * https://github.com/hectorm/otpauth/blob/master/src/internal/encoding/uint.js
 *
 * @param { number } value Integer.
 * @returns { Uint8Array } Uint8Array.
 *
 * @example
 *       0 → [0, 0, 0, 0, 0, 0, 0, 0]
 *       1 → [0, 0, 0, 0, 0, 0, 0, 1]
 *     127 → [0, 0, 0, 0, 0, 0, 0, 127]
 *     256 → [0, 0, 0, 0, 0, 0, 1, 0]
 *     512 → [0, 0, 0, 0, 0, 0, 2, 0]
 *   65025 → [0, 0, 0, 0, 0, 1, 0, 0]
 */
const uintDecode = (value: number): Uint8Array => {
  const output = new Uint8Array(8); // 64 bits across 8 bytes

  let bigValue = BigInt(value);

  for (let i = 7; i >= 0 && bigValue > 0n; i--) {
    output[i] = Number(bigValue & 0xffn); // Extract the lowest 8 bits
    bigValue >>= 8n; // Shift right by 8 bits
  }

  return output;
};

export { uintDecode };
