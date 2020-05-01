import { chunkify } from "../src/chunkify";
import {} from "jest";

test("empty input", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {}

  for await (const _chunk of chunkify(10, generator())) {
    fail("expected 0 iterations for empty input");
  }
});
test("1 exact chunk", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {
    yield new Uint8Array(10);
  }

  let processed = 0;
  for await (const chunk of chunkify(10, generator())) {
    expect(processed++).toBe(0);
    expect(chunk).toEqual(new Uint8Array(10));
  }
});
test("2 exact chunks", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {
    yield new Uint8Array(10);
    yield new Uint8Array(10);
  }

  let processed = 0;
  for await (const chunk of chunkify(10, generator())) {
    expect(processed++).toBeLessThan(2);
    expect(chunk).toEqual(new Uint8Array(10));
  }
});
test("1 small chunk", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {
    yield new Uint8Array(5);
  }

  let processed = 0;
  for await (const chunk of chunkify(10, generator())) {
    expect(processed++).toBe(0);
    expect(chunk).toEqual(new Uint8Array(5));
  }
});
test("1.5 expected chunks", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {
    yield new Uint8Array(5);
    yield new Uint8Array(5);
    yield new Uint8Array(5);
  }

  const expected = [new Uint8Array(10), new Uint8Array(5)];

  let processed = 0;
  for await (const chunk of chunkify(10, generator())) {
    expect(chunk).toEqual(expected[processed++]);
  }
});

test("1.8 expected chunks", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {
    yield new Uint8Array(6);
    yield new Uint8Array(6);
    yield new Uint8Array(6);
  }

  const expected = [new Uint8Array(10), new Uint8Array(8)];

  let processed = 0;
  for await (const chunk of chunkify(10, generator())) {
    expect(chunk).toEqual(expected[processed++]);
  }
});

test("large chunks", async () => {
  async function* generator(): AsyncIterable<Uint8Array> {
    yield new Uint8Array(12);
    yield new Uint8Array(12);
  }

  const expected = [new Uint8Array(10), new Uint8Array(10), new Uint8Array(4)];

  let processed = 0;
  for await (const chunk of chunkify(10, generator())) {
    expect(chunk).toEqual(expected[processed++]);
  }
});
