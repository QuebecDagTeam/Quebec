import mongoose from "mongoose";

const EncryptedKeySchema = new mongoose.Schema({
  for: { type: String, required: true }, // wallet address
  encryptedKey: { type: String, required: true }, // eth-crypto stringified cipher
});

const KYCRecordSchema = new mongoose.Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    cid: { type: String, required: true }, // web3.storage CID
    kycHash: { type: String, required: true },
    encryptedKeys: { type: [EncryptedKeySchema], default: [] }, // keys encrypted per recipient
  },
  { timestamps: true }
);

const KYCRecord = mongoose.model("KYCRecord", KYCRecordSchema);
export default KYCRecord;
