import { createCipheriv, randomBytes, CipherCCMTypes } from "crypto";
import { chunkify } from "./chunkify";
import { defaultOptions } from "./options";

export async function* encrypt(
  key: Uint8Array,
  plaintext: AsyncIterable<Uint8Array>,
  options = defaultOptions
): AsyncIterable<Uint8Array> {
  const { algorithm, authTagLength, nonceLength, associatedData } = options;

  const chunkSize = options.chunkSize - nonceLength - authTagLength;

  let chunkIndex = 0;
  for await (const chunk of chunkify(chunkSize, plaintext)) {
    const nonce = randomBytes(nonceLength);

    let cipher = createCipheriv(algorithm as CipherCCMTypes, key, nonce, {
      authTagLength,
    });

    let aad = Buffer.from([chunkIndex++]);
    if (associatedData) {
      aad = Buffer.concat([aad, associatedData]);
    }
    cipher.setAAD(aad, {
      plaintextLength: chunk.length,
    });

    const ciphertext = cipher.update(chunk);
    cipher.final();
    const authTag = cipher.getAuthTag();

    yield Buffer.concat([nonce, ciphertext, authTag]);
  }
}
