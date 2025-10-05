// backend/src/services/encrypt.ts
import crypto from "crypto";
import EthCrypto from "eth-crypto";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY || ""; // 32 bytes string for AES-256-GCM; only for server-side use (not user private keys).
if (SECRET_KEY.length < 32) {
  console.warn("SECRET_KEY < 32 chars — development only. Use secure 32-byte key for production.");
}

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes recommended for GCM
const TAG_LENGTH = 16;

export function generateSymmetricKey(): string {
  return crypto.randomBytes(32).toString("hex"); // 256-bit key as hex
}

export function aesGcmEncryptHex(plain: Buffer | string, hexKey: string) {
  const key = Buffer.from(hexKey, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  const data = Buffer.isBuffer(plain) ? plain : Buffer.from(plain, "utf-8");

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Return hex: iv:tag:ciphertext
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function aesGcmDecryptHex(encryptedHex: string, hexKey: string) {
  const key = Buffer.from(hexKey, "hex");
  const parts = encryptedHex.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const ciphertext = Buffer.from(parts[2], "hex");

  const decipher = crypto.createDecipheriv(ALGO, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted; // Buffer (for files) or toString('utf-8') for text
}

// Encrypt symmetric key for a recipient (Ethereum public key - hex, uncompressed)
// Encrypt symmetric key for a recipient (Ethereum public key - hex, uncompressed)
export async function encryptSymmetricKeyForRecipient(symKeyHex: string, recipientPubKeyHex: string) {
  const pubKey = recipientPubKeyHex.startsWith("0x")
    ? recipientPubKeyHex.slice(2)
    : recipientPubKeyHex;

  // Await the asynchronous encryption
  const encrypted = await EthCrypto.encryptWithPublicKey(pubKey, symKeyHex);

  return EthCrypto.cipher.stringify(encrypted);
}

// Decrypt symmetric key (recipient side) with their privateKey
export function decryptSymmetricKeyWithPrivate(encryptedStr: string, recipientPrivateKeyHex: string) {
  const parsed = EthCrypto.cipher.parse(encryptedStr);
  const decrypted = EthCrypto.decryptWithPrivateKey(recipientPrivateKeyHex, parsed);
  return decrypted; // plaintext symKeyHex
}
