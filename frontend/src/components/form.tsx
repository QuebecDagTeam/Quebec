import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import axios from "axios";
import { abi } from "../constants/abi"; // your contract ABI
import { encryptData } from "./encrypt";

const DAGKYC_CONTRACT = "0x1011a9BBe451b13A98796616dd0F445a12cbFf3A";

function base64ToHex(base64: string): `0x${string}` {
  const raw = atob(base64);
  let hex = "";
  for (let i = 0; i < raw.length; i++) {
    const h = raw.charCodeAt(i).toString(16).padStart(2, "0");
    hex += h;
  }
  return `0x${hex}` as `0x${string}`;
}

const UserKYCForm: React.FC = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [formData, setFormData] = useState({ name: "", email: "", nin: "" });
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert("Please connect your wallet first.");
    setLoading(true);

    try {
      // 1️⃣ Encrypt form data
      const encryptedBase64 = encryptData(formData); // should return a base64 string
      const encryptedHex = base64ToHex(encryptedBase64); // convert to 0x-prefixed hex for blockchain

      // 2️⃣ Write encrypted data on-chain
      const hash = await writeContractAsync({
        address: DAGKYC_CONTRACT as `0x${string}`,
        abi,
        functionName: "registerKyc",
        args: [address, encryptedHex], // (address, bytes/string)
      });

      setTxHash(hash);

      // 3️⃣ Optional: wait for transaction confirmation
      const receipt = await window.ethereum.request({
        method: "eth_getTransactionReceipt",
        params: [hash],
      });

      if (receipt) {
        // 4️⃣ Save KYC data to backend for off-chain storage
        await axios.post("http://localhost:5000/api/kyc/register", {
          walletAddress: address,
          encryptedData: encryptedBase64,
          transactionHash: hash,
        });

        alert("✅ KYC submitted successfully!");
      }
    } catch (err) {
      console.error("KYC submission failed:", err);
      alert("❌ Error submitting KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 border rounded-lg space-y-4 bg-white shadow-md"
    >
      <h2 className="text-xl font-bold">Submit KYC</h2>

      <input
        type="text"
        name="name"
        placeholder="Full name"
        className="border p-2 w-full rounded"
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email address"
        className="border p-2 w-full rounded"
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="nin"
        placeholder="National ID Number"
        className="border p-2 w-full rounded"
        onChange={handleChange}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {txHash && (
        <p className="text-sm text-green-600 mt-2 break-all">
          ✅ Transaction sent: {txHash}
        </p>
      )}
    </form>
  );
};

export default UserKYCForm;
