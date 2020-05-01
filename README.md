# aead-stream

Authenticated encryption on arbitrary large files

aead-stream is a simple API to perform authenticated symmetric encrytion on data of arbitrary size.

## Install

```
$ npm install aead-stream
```

## Usage

### `encrypt(key, plaintext[, options])`

- `key` [\<Uint8Array\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) the symmetric key used to encrypt the data
- `plaintext` [\<AsyncIterable<Uint8Array\>\>](https://tc39.es/ecma262/#sec-asynciterable-interface) a stream of Uint8Arrays with the plaintext data
- `options` [\<Object\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) **Default:** [default options](#default-options)
  - `algorithm` [\<string\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type) a valid algorithm for [`crypto.createCipheriv`](https://nodejs.org/docs/latest-v13.x/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_options)
  - `nonceLength` [\<number\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) the length of generated nonces in bytes
  - `authTagLength` [\<number\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) the length of the authentication tag
  - `chunkSize` [\<number\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type) the size of a ciphertext chunk (including nonce and authentication tag)
  - `associatedData` [\<Uint8Array\>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) optional additional data to be used for authentication tag calculation

<details>
<summary><i>Click to view example</i></summary>

```javascript
const { encrypt } = require("aead-stream");
const { createReadStream } = require("fs");

/**
 * @param {Uint8Array} key 256 bit key material
 * @param {string} filepath a file path
 */
async function encyptFile(key, filepath) {
  const readStream = createReadStream(filepath);

  for await (const encryptedChunk of encrypt(key, readStream)) {
    // store encryptedChunk - it is a Uint8Array with at most 64K size
  }
}
```

</details>

### Default options

- `algorithm` "chacha20-poly1305",
- `nonceLength` 12,
- `authTagLength` 16,
- `chunkSize` 64 \* 1024 _(64K)_
