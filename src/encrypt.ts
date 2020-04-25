import { createCipheriv, randomBytes, CipherCCMTypes } from "crypto";
import { chunkify } from "./chunkify";
import { defaultOptions } from "./options";

export async function* encrypt(
  key: Uint8Array,
  plaintext: AsyncIterable<Uint8Array>,
  options = defaultOptions
): AsyncIterable<Uint8Array> {
  const { algorithm, authTagLength, nonceLength } = options;

  const chunksize = 1024 * 64 - nonceLength - authTagLength; // 64K - nonce - tagLength

  let chunkIndex = 0;
  for await (const chunk of chunkify(chunksize, plaintext)) {
    const nonce = randomBytes(nonceLength);

    let cipher = createCipheriv(algorithm as CipherCCMTypes, key, nonce, {
      authTagLength,
    });

    cipher.setAAD(Buffer.from([chunkIndex++]), {
      plaintextLength: chunk.length,
    });

    const ciphertext = cipher.update(chunk);
    cipher.final();
    const authTag = cipher.getAuthTag();

    yield Buffer.concat([nonce, ciphertext, authTag]);
  }
}
