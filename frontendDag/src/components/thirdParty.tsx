// src/pages/ThirdPartyDashboard.tsx
import { useState } from "react";
import { apiClient } from "../../../frontend/src/utils/api";
import { decryptData } from "./encrypt";
import { useAccount } from "wagmi";

export default function ThirdPartyDashboard() {
  const { address } = useAccount();
  const [userAddress, setUserAddress] = useState("");
  const [kycData, setKycData] = useState<any>(null);

  const requestAccess = async () => {
    await apiClient.post("/thirdparty/request-access", {
      requester: address,
      targetUser: userAddress,
    });
    alert("Access request sent!");
  };

  const viewKYC = async () => {
    const res = await apiClient.get(`/thirdparty/view-kyc/${userAddress}`);
    const decrypted = decryptData(res.data.encryptedData);
    setKycData(decrypted);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Third Party Dashboard</h1>
      <input
        type="text"
        placeholder="User Wallet Address"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <button onClick={requestAccess} className="bg-yellow-600 text-white p-2 rounded mr-3">
        Request Access
      </button>
      <button onClick={viewKYC} className="bg-blue-600 text-white p-2 rounded">
        View KYC
      </button>

      {kycData && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Decrypted User Data:</h2>
          <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(kycData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
