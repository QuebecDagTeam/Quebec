import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { abi } from "../../constants/abi";
import { encryptData } from "../../components/encrypt";
import { Input } from "../../components/input";
import { Link } from "react-router-dom";

const DAGKYC_CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

function base64ToHex(base64: string): `0x${string}` {
  const raw = atob(base64);
  let hex = "";
  for (let i = 0; i < raw.length; i++) {
    const h = raw.charCodeAt(i).toString(16).padStart(2, "0");
    hex += h;
  }
  return `0x${hex}`;
}

interface FormData {
  APPName: string;
  detail: string;
  desc: string;
  website: string;
  walletAddress: string;
}

export const ThirdPartyAuth: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [formData, setFormData] = useState<FormData>({
    APPName: "",
    detail: "",
    desc: "",
    website: "",
    walletAddress: "",
  });

  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null); // null = unknown
  const [checkingRegistration, setCheckingRegistration] = useState(false);


  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, walletAddress: address }));
      checkWalletRegistration(address);
    } else {
      setIsRegistered(null);
    }
  }, [address]);

  const checkWalletRegistration = async (walletAddress: string) => {
    try {
      setCheckingRegistration(true);
      const response = await fetch(`https://quebec-ur3w.onrender.com/api/kyc/isRegistered_thirdParty/${walletAddress}`);
      const data = await response.json();
      setIsRegistered(data?.registered);
      if(!data){
        alert("Error checking registration status, check your connection and try again.");
        return
      }
      console
    } catch (err) {
      console.error("Failed to check wallet registration:", err);
      setIsRegistered(false);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value || "" }));
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!address) {
    alert("Please connect your wallet first.");
    return;
  }

  setLoading(true);

  try {
    // Encrypt the form data using the encryptData function.
    const encryptedBase64 = encryptData(formData);
    const encryptedHex = base64ToHex(encryptedBase64);

    // Call the smart contract to register KYC.
    const hash = await writeContractAsync({
      address: DAGKYC_CONTRACT,
      abi,
      functionName: "registerKyc",
      args: [address, encryptedHex],
    });

    setTxHash(hash);

    // Send the data to the backend (e.g., to save it in the database).
    const response = await fetch("https://quebec-ur3w.onrender.com/api/kyc/register_thirdparty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appName: formData.APPName,
        detail: formData.detail,
        description: formData.desc,
        website: formData.website,
        transactionHash: hash, // Include the transaction hash
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    alert("✅ ThirdParty Registered successfully!");
    setIsRegistered(true); // Optimistic update
  } catch (err) {
    console.error("KYC submission failed:", err);
    alert("❌ Error submitting KYC");
  } finally {
    setLoading(false);
  }
};


  return (
    <section className="min-h-screen bg-[#000306] font-inter relative">
      <div className="container mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
        {(checkingRegistration || isRegistered === null) && isConnected && (
          <div className="fixed inset-0 bg-black bg-opacity-80 text-white z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#8C2A8F] mx-auto" />
              <p className="text-xl font-semibold">Checking registration status...</p>
            </div>
          </div>
        )}

        {/* Show if user is already registered */}
        {isConnected && isRegistered === true && !checkingRegistration && (
          <div className="text-center text-white py-20">
            <h2 className="text-3xl font-bold text-green-400 mb-4">✅ You have already completed KYC</h2>
            <p className="text-gray-400">No further action is required at this time. might want to go to  <Link to='/pricing'>dashboard</Link></p>
          </div>
        )}

        {isConnected && isRegistered === false && (
          <>
          
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-blue-400">
                  Register Your Third Party App
                </h1>
              </>
            

            <form onSubmit={handleSubmit} className="w-full rounded-2xl max-w-4xl mx-auto space-y-8 border-1 border-[#71627A]">
            
                <div className="text-white">
                  <aside className="p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">App Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="App Name" name="App Name" placeholder="e.g, DeFI Analystics Pro" value={formData.APPName} action={handleChange} />
                      <Input label="Brief Description" name="desc" placeholder="Describe what your application does" value={formData.desc} action={handleChange} />
                      <Input label="Website   " name="website" placeholder="https://example.com" value={formData.website} action={handleChange} />
                      <Input label="Additional Details   (optional)" name="detail" placeholder="Any  other information for integation" value={formData.detail} action={handleChange} />
                    </div>
                  </aside>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    Current Wallet Address: {address || 'Not Connected'}
                  </p>
                </div>
            
            

              {/* Submit Button */}
              <div className="px-4 py-2">
              <button type="submit" disabled={loading || !address} className={`mt-8 w-full px-6 py-4 rounded-xl text-lg font-bold transition duration-300 
                ${loading || !address ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#8C2A8F] text-white shadow-lg shadow-bg-[#8C2A8F] '}`}>
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit'
                )}
              </button>
              </div>

              {txHash && (
                <p className="mt-4 text-sm text-center text-green-400 break-all">
                  Mock Transaction Hash: <span className="font-mono">{txHash}</span>
                </p>
              )}
            </form>
          </>
        )}

        {/* Show if user is already registered */}
        {isConnected && isRegistered === true && !checkingRegistration && (
          <div className="text-center text-white py-20">
            <h2 className="text-3xl font-bold text-green-400 mb-4">✅ You have already completed KYC</h2>
            <p className="text-gray-400">No further action is required at this time. might want to go to  <Link to='/user'>dashboard</Link></p>
          </div>
        )}

        {!isConnected && (
          <div className="text-center text-white py-20">
            <h2 className="text-2xl font-semibold">🔌 Please connect your wallet to continue.</h2>
          </div>
        )}
      </div>
    </section>
  );
};

export default ThirdPartyAuth;
