import CryptoJS from "crypto-js";

// Assuming this key is set in your environment variables correctly
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export const encryptData = (data: any) => {
  try {
    const json = JSON.stringify(data);
    const ciphertext = CryptoJS.AES.encrypt(json, SECRET_KEY).toString();
    console.log("Encrypted Data:", ciphertext);  // Log the encrypted data
    return ciphertext;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

export const decryptData = (ciphertext: string) => {
  try {
    // Check if ciphertext is a valid encrypted string
    if (!ciphertext) {
      throw new Error("Ciphertext is invalid or empty");
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error("Decryption failed, invalid ciphertext or key");
    }
    
    const decryptedData = JSON.parse(decrypted);
    console.log("Decrypted Data:", decryptedData);  // Log the decrypted data
    return decryptedData;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

