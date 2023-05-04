import { chunkify } from "../chunkify";
import { concat, encodeUint32, webcrypto } from "./util";

const profiles = { "AES-GCM": 1 };

export type WebEncryptOptions = {
  profile?: keyof typeof profiles;
  chunkSize?: number;
  associatedData?: Uint8Array;
};

const defaultOptions = {
  profile: "AES-GCM",
  chunkSize: 64 * 1024, // 64K
} satisfies WebEncryptOptions;

export async function* webEncrypt(
  key: CryptoKey,
  plaintext: AsyncIterable<Uint8Array>,
  options: WebEncryptOptions = defaultOptions
) {
  // magic number
  yield new TextEncoder().encode("aead");

  switch (options.profile ?? "AES-GCM") {
    case "AES-GCM":
      yield* aesGcmEncrypt(key, plaintext, options);
      return;
    default:
      throw new Error("unsupported profile: " + options.profile);
  }
}

async function* aesGcmEncrypt(
  key: CryptoKey,
  plaintext: AsyncIterable<Uint8Array>,
  options: WebEncryptOptions = defaultOptions
) {
  const nonceLength = 12;
  const authTagLength = 16;

  const cipherTextChunkSize = options.chunkSize ?? defaultOptions.chunkSize;
  const chunkSize = cipherTextChunkSize - nonceLength - authTagLength;

  yield Uint8Array.of(
    profiles["AES-GCM"],
    ...encodeUint32(cipherTextChunkSize)
  );

  const crypto = await webcrypto();

  let chunkIndex = 0;
  for await (const chunk of chunkify(chunkSize, plaintext)) {
    const nonce = new Uint8Array(nonceLength);
    crypto.getRandomValues(nonce);

    let aad = encodeUint32(chunkIndex++);
    if (options.associatedData) {
      aad = concat(aad, options.associatedData);
    }

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        additionalData: aad,
        tagLength: authTagLength * 8,
      },
      key,
      chunk
    );

    yield concat(nonce, new Uint8Array(ciphertext));
  }
}
