const { encrypt, decrypt } = require(".");
const { randomBytes, createHash } = require("crypto");

const plaintext = randomBytes(130 * 1024);

async function* plain() {
  yield plaintext;
  yield plaintext;
}

async function main() {
  const key = randomBytes(32);

  let sha256 = createHash("sha256");
  sha256.update(plaintext);
  sha256.update(plaintext);
  console.log(sha256.digest("hex"));

  const ciphertext = [];
  for await (const chunk of encrypt(key, plain())) {
    ciphertext.push(chunk);
  }

  async function* encrypted() {
    for (const chunk of ciphertext) {
      yield chunk;
    }
  }

  const plains = [];
  for await (const chunk of decrypt(key, encrypted())) {
    plains.push(chunk);
  }

  sha256 = createHash("sha256");
  sha256.update(Buffer.concat(plains));
  console.log(sha256.digest("hex"));

  console.log("done");
}

main().catch(console.error);
