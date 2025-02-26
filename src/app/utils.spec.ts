import { uintDecode } from './utils';

describe('utils', () => {
  describe('uintDecode', () => {
    const TEST_CASES = [
      {
        input: Number.MIN_SAFE_INTEGER,
        output: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        input: 0,
        output: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      {
        input: 255,
        output: [0, 0, 0, 0, 0, 0, 0, 255],
      },
      {
        input: 256,
        output: [0, 0, 0, 0, 0, 0, 1, 0],
      },
      {
        input: 512,
        output: [0, 0, 0, 0, 0, 0, 2, 0],
      },
      {
        input: 65025,
        output: [0, 0, 0, 0, 0, 1, 0, 0],
      },
      {
        input: Number.MAX_SAFE_INTEGER,
        output: [0, 31, 255, 255, 255, 255, 255, 255],
      },
    ];

    TEST_CASES.forEach(({ input, output }) => {
      it(`should return expected array when input is ${input}`, () => {
        expect(Array.from(uintDecode(input))).toEqual(
          jasmine.arrayWithExactContents(output),
        );
      });
    });
  });
});
