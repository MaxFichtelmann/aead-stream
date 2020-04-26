import { chunkify } from "./chunkify";
import { createDecipheriv, DecipherCCM, CipherCCMTypes } from "crypto";
import { defaultOptions } from "./options";

export async function* decrypt(
  key: Uint8Array,
  ciphertext: AsyncIterable<Uint8Array>,
  options = defaultOptions
) {
  const { algorithm, authTagLength, nonceLength } = options;

  const chunksize = 1024 * 64; // 64K

  let chunkIndex = 0;
  for await (const chunk of chunkify(chunksize, ciphertext)) {
    const nonce = chunk.slice(0, nonceLength);
    const authTag = chunk.slice(-authTagLength);

    let cipher = createDecipheriv(algorithm as CipherCCMTypes, key, nonce, {
      authTagLength,
    });

    cipher.setAAD(Buffer.from([chunkIndex++]), {
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
