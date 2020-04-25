/**
 * Stream transformation function that outputs chucks of a defined size.
 * The last chunk contains the rest of the data and may be smaller than the other chunks
 *
 * @param size the size of the chucks (except the last one)
 * @param stream the input stream of data
 */
export async function* chunkify(
  size: number,
  stream: AsyncIterable<Uint8Array>
) {
  if (typeof stream[Symbol.asyncIterator] !== "function") {
    throw new TypeError("invalid input - expected an async iterable");
  }

  const buffer = new Uint8Array(size);
  let length = 0;

  for await (const chunk of stream) {
    let offset = 0;
    do {
      const slice = chunk.slice(
        offset,
        offset + Math.min(size - length, chunk.length)
      );
      buffer.set(slice, length);
      length += slice.length;
      offset += slice.length;

      if (length === size) {
        yield buffer;
        length = 0;
      }
    } while (offset < chunk.length);
  }

  if (length > 0) {
    yield buffer.slice(0, length);
  }
}
