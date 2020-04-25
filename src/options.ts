import { CipherCCMTypes, CipherGCMTypes } from "crypto";

export type Options = {
  algorithm: CipherCCMTypes | CipherGCMTypes;
  nonceLength: number;
  authTagLength: number;
  chunkSize: number;
};

export const defaultOptions: Options = {
  algorithm: "aes-256-gcm",
  nonceLength: 12,
  authTagLength: 16,
  chunkSize: 64 * 1024, // 64K
};
