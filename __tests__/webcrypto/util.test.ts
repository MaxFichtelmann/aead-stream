import {
  concat,
  decodeUint32,
  encodeUint32,
  prepend,
  shift,
} from "../../src/webcrypto/util";

test("concat 0 arrays", () => {
  expect(concat()).toEqual(new Uint8Array(0));
});

test("concat 1 array", () => {
  const array = new Uint8Array([1, 2, 3]);

  expect(concat(array)).toEqual(array);
});

test("concat 2 arrays", () => {
  const a1 = new Uint8Array([1, 2]);
  const a2 = new Uint8Array([3, 4]);
  const expected = new Uint8Array([1, 2, 3, 4]);

  expect(concat(a1, a2)).toEqual(expected);
});

test("concat 5 arrays", () => {
  const a1 = new Uint8Array([1, 2]);
  const a2 = new Uint8Array([3, 4]);
  const a3 = new Uint8Array([5, 6]);
  const a4 = new Uint8Array([7, 8]);
  const a5 = new Uint8Array([9, 0]);
  const expected = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

  expect(concat(a1, a2, a3, a4, a5)).toEqual(expected);
});

test("prepend empty prefix", async () => {
  const prefix = new Uint8Array(0);
  const stream = toStream(new Uint8Array([1, 2]));

  expect(await fromStream(prepend(prefix, stream))).toEqual(
    new Uint8Array([1, 2])
  );
});

test("prepend prefix to data", async () => {
  const prefix = new Uint8Array([1, 2]);
  const stream = toStream(new Uint8Array([3]), new Uint8Array([4, 5, 6]));

  expect(await fromStream(prepend(prefix, stream))).toEqual(
    new Uint8Array([1, 2, 3, 4, 5, 6])
  );
});

test("prepend prefix to empty data", async () => {
  const prefix = new Uint8Array([1, 2]);
  const stream = toStream();

  expect(await fromStream(prepend(prefix, stream))).toEqual(
    new Uint8Array([1, 2])
  );
});

test("shift full size", async () => {
  const stream = toStream(
    new Uint8Array([1]),
    new Uint8Array([2]),
    new Uint8Array([3])
  );

  const [prefix, restStream] = await shift(3, stream);

  expect(prefix).toEqual(new Uint8Array([1, 2, 3]));
  expect(await fromStream(restStream)).toEqual(new Uint8Array(0));
});

test("shift too short", async () => {
  const stream = toStream(
    new Uint8Array([1]),
    new Uint8Array([2]),
    new Uint8Array([3])
  );

  expect(() => shift(10, stream)).rejects.toThrow();
});

test("shift prefix from data", async () => {
  const stream = toStream(
    new Uint8Array([1]),
    new Uint8Array([2]),
    new Uint8Array([3])
  );

  const [prefix, restStream] = await shift(2, stream);

  expect(prefix).toEqual(new Uint8Array([1, 2]));
  expect(await fromStream(restStream)).toEqual(new Uint8Array([3]));
});

test("shift prefix from data", async () => {
  const stream = toStream(new Uint8Array([1, 2, 3]), new Uint8Array([4, 5]));

  const [prefix, restStream] = await shift(2, stream);

  expect(prefix).toEqual(new Uint8Array([1, 2]));
  expect(await fromStream(restStream)).toEqual(new Uint8Array([3, 4, 5]));
});

test("int32 encoding/decoding", () => {
  const numbers = [0, 0xa0, 0xa0a0, 0xa0a0a0, 0xa0a0a0a0, 0xffffffff];

  for (const num of numbers) {
    const encoded = encodeUint32(num);

    expect(decodeUint32(encoded)).toEqual(num);
  }
});

async function* toStream(...chunks: Uint8Array[]) {
  for (const chunk of chunks) {
    yield chunk;
  }
}

async function fromStream(stream: AsyncIterable<Uint8Array>) {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return concat(...chunks);
}
