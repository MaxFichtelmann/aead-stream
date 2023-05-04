export async function webcrypto(): Promise<Crypto> {
  if (typeof window === "undefined") {
    const { webcrypto } = await import("crypto");

    return webcrypto as Crypto;
  } else {
    return window.crypto;
  }
}

export function concat(...arrays: Uint8Array[]) {
  const size = arrays.reduce((acc, cur) => acc + cur.length, 0);

  const merged = new Uint8Array(size);
  let offset = 0;
  for (const array of arrays) {
    merged.set(array, offset);
    offset += array.length;
  }

  return merged;
}

export async function* prepend(
  prefix: Uint8Array,
  stream: AsyncIterable<Uint8Array>
) {
  yield prefix;
  yield* stream;
}

export async function shift(
  length: number,
  stream: AsyncIterable<Uint8Array>
): Promise<[Uint8Array, AsyncIterable<Uint8Array>]> {
  const prefix = new Uint8Array(length);

  let offset = 0;

  const iterator = stream[Symbol.asyncIterator]();

  while (true) {
    const { done, value } = await iterator.next();

    if (done) {
      throw new Error("Buffer underflow");
    } else {
      const chunk = value;
      if (chunk.length < length - offset) {
        prefix.set(chunk, offset);
        offset += chunk.length;
      } else {
        const slice = chunk.slice(0, length - offset);
        prefix.set(slice, offset);

        return [prefix, prepend(chunk.slice(slice.length), stream)];
      }
    }
  }
}

export function encodeUint32(num: number) {
  const buffer = new ArrayBuffer(4);

  new DataView(buffer).setUint32(0, num);

  return new Uint8Array(buffer);
}

export function decodeUint32(encoded: Uint8Array) {
  if (encoded.length != 4) {
    throw new Error("invalid input: length != 4");
  }

  return new DataView(
    encoded.buffer,
    encoded.byteOffset,
    encoded.byteLength
  ).getUint32(0);
}
