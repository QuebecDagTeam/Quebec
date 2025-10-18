// hooks/useQuebecKYC.ts
import { useWriteContract } from "wagmi";
import { abi } from "../constants/abi";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

export const useQuebecKYC = () => {
  const { writeContractAsync } = useWriteContract();

  const registerUser = async (encryptedDataHash: string, symKey: Uint8Array, uniqueId: number) => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "Register_User",
        args: [encryptedDataHash, symKey, uniqueId],
      });
      console.log("✅ User registered with KYC ID:", uniqueId);
      return txHash;
    } catch (err) {
      console.error("❌ registerUser failed:", err);
    }
  };
  const updateKYC = async (kycId: number, encryptedDataHash: string) => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "updateKyc",
        args: [kycId, encryptedDataHash],
      });
      console.log("✅ KYC updated for ID:", kycId);
      return txHash;
    } catch (err) {
      console.error("❌ updateKYC failed:", err);
    }
  };

  const requestAccess = async (kycId: number, metadata: string) => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "requestAccess",
        args: [kycId, metadata],
      });
      console.log("✅ Access requested for KYC ID:", kycId);
      return txHash;
    } catch (err) {
      console.error("❌ requestAccess failed:", err);
    }
  };

  const grantAccess = async (kycId: number, recipient: string, encryptedSymKey: Uint8Array) => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "grantAccess",
        args: [kycId, recipient, encryptedSymKey],
      });
      console.log(`✅ Access granted to ${recipient} for KYC ID: ${kycId}`);
      return txHash;
    } catch (err) {
      console.error("❌ grantAccess failed:", err);
    }
  };

  const revokeAccess = async (kycId: number, recipient: string) => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "revokeAccess",
        args: [kycId, recipient],
      });
      console.log(`✅ Access revoked from ${recipient} for KYC ID: ${kycId}`);
      return txHash;
    } catch (err) {
      console.error("❌ revokeAccess failed:", err);
    }
  };

  const updateEncryptedKey = async (kycId: number, recipient: string, encryptedSymKey: Uint8Array) => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "updateEncryptedKey",
        args: [kycId, recipient, encryptedSymKey],
      });
      console.log(`✅ Encrypted key updated for recipient ${recipient}, KYC ID: ${kycId}`);
      return txHash;
    } catch (err) {
      console.error("❌ updateEncryptedKey failed:", err);
    }
  };

  const registerThirdParty = async () => {
    try {
      const txHash = await writeContractAsync({
        abi,
        address: CONTRACT_ADDRESS,
        functionName: "registerThirdParty",
        args: [],
      });
      console.log("✅ Third party registered");
      return txHash;
    } catch (err) {
      console.error("❌ registerThirdParty failed:", err);
    }
  };

  return {
    registerUser,
    updateKYC,
    requestAccess,
    grantAccess,
    revokeAccess,
    updateEncryptedKey,
    registerThirdParty,
  };
};
