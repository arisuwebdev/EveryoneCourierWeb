import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_URL_SECRET_KEY;

export const encryptId = (id) => {
  return CryptoJS.AES.encrypt(String(id), SECRET_KEY).toString();
};

export const decryptId = (encryptedId) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedId, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
      throw new Error("Invalid encrypted ID");
    }

    return decrypted;
  } catch (error) {
    return null;
  }
};