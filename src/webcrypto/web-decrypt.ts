import { chunkify } from "../chunkify";
import { webcrypto, shift, decodeUint32, encodeUint32, concat } from "./util";

const profiles = { "AES-GCM": 1 };

export type WebDecryptOptions = {
  associatedData?: Uint8Array;
};

const defaultOptions = {} satisfies WebDecryptOptions;

export async function* webDecrypt(
  key: CryptoKey,
  ciphertext: AsyncIterable<Uint8Array>,
  options: WebDecryptOptions = defaultOptions
) {
  const [header, chunkStream] = await shift(9, ciphertext);

  if (new TextDecoder().decode(header.slice(0, 4)) !== "aead") {
    throw new Error("invalid input: magic number mismatch");
  }

  const profile = header[4];
  const chunksize = decodeUint32(header.slice(5));

  switch (profile) {
    case profiles["AES-GCM"]:
      yield* aesGcmDecrypt(key, chunkify(chunksize, chunkStream), options);
      return;
    default:
      throw new Error("unsupported profile: " + profile);
  }
}

async function* aesGcmDecrypt(
  key: CryptoKey,
  ciphertext: AsyncIterable<Uint8Array>,
  options: WebDecryptOptions
) {
  const nonceLength = 12;
  const authTagLength = 16;

  const crypto = await webcrypto();

  let chunkIndex = 0;
  for await (const chunk of ciphertext) {
    let aad = encodeUint32(chunkIndex++);
    if (options.associatedData) {
      aad = concat(aad, options.associatedData);
    }

    const nonce = chunk.slice(0, nonceLength);

    const ciphertext = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        additionalData: aad,
        tagLength: authTagLength * 8,
      },
      key,
      chunk.slice(nonceLength)
    );

    yield new Uint8Array(ciphertext);
  }
}
