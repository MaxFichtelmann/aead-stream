import { chunkify } from "./chunkify";
import { createDecipheriv, DecipherCCM, CipherCCMTypes } from "crypto";
import { defaultOptions } from "./options";

export async function* decrypt(
  key: Uint8Array,
  ciphertext: AsyncIterable<Uint8Array>,
  options = defaultOptions
) {
  const {
    algorithm,
    authTagLength,
    nonceLength,
    associatedData,
    chunkSize,
  } = options;

  let chunkIndex = 0;
  for await (const chunk of chunkify(chunkSize, ciphertext)) {
    const nonce = chunk.slice(0, nonceLength);
    const authTag = chunk.slice(-authTagLength);

    let cipher = createDecipheriv(algorithm as CipherCCMTypes, key, nonce, {
      authTagLength,
    });

    let aad = Buffer.from([chunkIndex++]);
    if (associatedData) {
      aad = Buffer.concat([aad, associatedData]);
    }
    cipher.setAAD(aad, {
      plaintextLength: chunk.length,
    });
    cipher.setAuthTag(authTag);

    const plaintext = cipher.update(
      chunk.slice(nonceLength, chunk.length - authTagLength)
    );
    cipher.final();

    yield plaintext;
  }
}
