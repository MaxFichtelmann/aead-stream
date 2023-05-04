import { webcrypto } from "crypto";
import { webEncrypt, webDecrypt } from "../../src/";
import exp from "constants";

test("roundtrip single chunk", async () => {
  const plaintextItems = [
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
  ];

  async function* generatePlain() {
    for (const item of plaintextItems) {
      yield new TextEncoder().encode(item);
    }
  }

  const key = await webcrypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );

  const ciphertextStream = webEncrypt(key, generatePlain());

  const decryptedChunks: Uint8Array[] = [];
  for await (const chunk of webDecrypt(key, ciphertextStream)) {
    decryptedChunks.push(chunk);
  }

  expect(Buffer.concat(decryptedChunks).toString("ascii")).toEqual(
    plaintextItems.join("")
  );
});

test("roundtrip multiple chunks", async () => {
  const plaintextItems = [
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
    "The quick brown fox jumps over the lazy dog",
  ];

  async function* generatePlain() {
    for (const item of plaintextItems) {
      yield new TextEncoder().encode(item);
    }
  }

  const key = await webcrypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );

  const chunkSize = plaintextItems[0].length + 12 + 16;

  const encryptedStream = webEncrypt(key, generatePlain(), {
    chunkSize,
  });

  const decryptedChunks: Uint8Array[] = [];
  for await (const chunk of webDecrypt(key, encryptedStream)) {
    decryptedChunks.push(chunk);
  }

  expect(Buffer.concat(decryptedChunks).toString("ascii")).toEqual(
    plaintextItems.join("")
  );
});
