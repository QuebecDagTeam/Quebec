// src/pages/UserDashboard.tsx
import { useState } from "react";
import { encryptData } from "./encrypt";
import { useAccount } from "wagmi";
import { apiClient } from "../utils/api";



export default function UserDashboard() {
  const { address } = useAccount();
  const [kyc, setKyc] = useState({ name: "", nin: "", dob: "" });
  const [thirdParty, setThirdParty] = useState("");

  const handleSave = async () => {
    const encrypted = encryptData(kyc);
    await apiClient.post("/user/register", {
      walletAddress: address,
      encryptedData: encrypted,
    });
    alert("KYC encrypted and stored on-chain!");
  };

  const whitelist = async () => {
    await apiClient.post("/user/whitelist", {
      userAddress: address,
      thirdPartyAddress: thirdParty,
    });
    alert("Third-party address whitelisted!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 mb-2 w-full"
          value={kyc.name}
          onChange={(e) => setKyc({ ...kyc, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="NIN"
          className="border p-2 mb-2 w-full"
          value={kyc.nin}
          onChange={(e) => setKyc({ ...kyc, nin: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 mb-2 w-full"
          value={kyc.dob}
          onChange={(e) => setKyc({ ...kyc, dob: e.target.value })}
        />
        <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded">
          Save Encrypted KYC
        </button>
      </div>

      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Third Party Wallet"
          className="border p-2 w-full"
          value={thirdParty}
          onChange={(e) => setThirdParty(e.target.value)}
        />
        <button onClick={whitelist} className="mt-2 bg-green-600 text-white p-2 rounded">
          Whitelist Third Party
        </button>
      </div>
    </div>
  );
}
