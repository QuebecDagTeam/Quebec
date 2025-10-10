// src/components/EncryptUtils.ts
import CryptoJS from "crypto-js";

const SECRET_KEY = 'a0f1d37ad6d239e5f6263a51380260cbec2d57d9a094a51e1c1bc2da0c2bfe35'; // set this in your .env

export const encryptData = (data: any) => {
  const json = JSON.stringify(data);
  return CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
};

