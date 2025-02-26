import { base32Encode } from '@ctrl/ts-base32';
import { generateTotp, truncate } from './otp';

const timestampFromSeconds = (secs: number): number => secs * 1000;

describe('otp', () => {
  describe('truncate', () => {
    const TEST_CASES = [
      {
        hash: [],
        output: 0,
      },
      {
        hash: [0, 1, 2, 3],
        output: 50331648,
      },
      {
        // 20 bytes for SHA-1 - the dynamic offset is the last byte = 14
        hash: [
          123, 185, 187, 24, 165, 125, 113, 227, 235, 37, 229, 221, 16, 11, 123,
          73, 81, 191, 0, 14,
        ],
        output: 2068402623, // Four bytes from offset
        // = [123, 73, 81, 191] = [0x7B, 0x49, 0x51, 0xBF] = 0x7B4951BF = 2068402623
      },
    ];

    TEST_CASES.forEach(({ hash, output }) => {
      it(`should return expected value when input is ${hash} (offset ${hash[hash.length - 1]})`, () => {
        expect(truncate(Uint8Array.from(hash))).toBe(output);
      });
    });
  });

  describe('generateOtp', () => {
    it('should return expected 6 digit value for 2000-01-01 00:00:00', async () => {
      const timestamp = timestampFromSeconds(946684800); // 2000-01-01 00:00:00
      expect(await generateTotp(timestamp, 'somekey')).toBe('876782');
    });

    /**
     * Implement the tests outlined in the spec: https://datatracker.ietf.org/doc/html/rfc6238
     */
    describe('from official spec', () => {
      let secret: string;
      const period = 30;
      const digits = 8;

      beforeEach(() => {
        // The spec uses '12345678901234567890' as the secret key, however, that can't be
        // decoded directly as it contains characters (e.g. 1 and zero) that are not in the
        // default 'RFC4648' encoding (see https://github.com/scttcper/ts-base32/blob/master/src/index.ts).
        // To fix this we can convert the secret to a 'char' array and then manually encode that
        // using the default variant.
        const buffer = Uint8Array.from(
          [...'12345678901234567890'].map((char) => char.charCodeAt(0)),
        );

        secret = base32Encode(buffer);
      });

      it('should return expected value for 1970-01-01 00:00:59', async () => {
        const timestamp = timestampFromSeconds(59); // 1970-01-01 00:00:59
        expect(await generateTotp(timestamp, secret, period, digits)).toBe(
          '94287082',
        );
      });

      it('should return expected value for 2005-03-18 01:58:29', async () => {
        const timestamp = timestampFromSeconds(1111111109); // 2005-03-18 01:58:29
        expect(await generateTotp(timestamp, secret, period, digits)).toBe(
          '07081804',
        );
      });

      it('should return expected value for 2009-02-13 23:31:30', async () => {
        const timestamp = timestampFromSeconds(1234567890); // 2009-02-13 23:31:30
        expect(await generateTotp(timestamp, secret, period, digits)).toBe(
          '89005924',
        );
      });

      it('should return expected value for 2033-05-18 03:33:20', async () => {
        const timestamp = timestampFromSeconds(2000000000); // 2009-02-13 03:33:20
        expect(await generateTotp(timestamp, secret, period, digits)).toBe(
          '69279037',
        );
      });
    });
  });
});
