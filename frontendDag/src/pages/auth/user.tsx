import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import axios from "axios";
import { abi } from "../../constants/abi";
import { encryptData } from "../../../../frontendDag/src/components/encrypt";
import { Input } from "../../../../frontendDag/src/components/input";
import FaceCapture from "../../../../frontendDag/src/components/faceCapture";

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
  fullName: string;
  email: string;
  dob: string;
  govIdType: string;
  govIdNumber: string;
  phone: string;
  walletAddress: string;
  residentialAddress: string;
}

export const UserAuth: React.FC = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    dob: "",
    govIdType: "",
    govIdNumber: "",
    phone: "",
    walletAddress: "",
    residentialAddress: "",
  });
const [progress, setProgress] = useState(1);

  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleProgress = (step: number) => {
    setProgress(step);
  }
  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, walletAddress: address }));
    }
  }, [address]);

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
      const encryptedBase64 = encryptData(formData);
      const encryptedHex = base64ToHex(encryptedBase64);

      const hash = await writeContractAsync({
        address: DAGKYC_CONTRACT,
        abi,
        functionName: "registerKyc",
        args: [address, encryptedHex],
      });

      setTxHash(hash);

      await axios.post("http://localhost:5000/api/kyc/register", {
        walletAddress: address,
        encryptedData: encryptedBase64,
        transactionHash: hash,
      });

      alert("✅ KYC submitted successfully!");
    } catch (err) {
      console.error("KYC submission failed:", err);
      alert("❌ Error submitting KYC");
    } finally {
      setLoading(false);
    }
  };
  const width = progress === 1 ? '50%' : '100%';
  return (
    <>
  

    <div className="min-h-screen bg-[#000306] p-4 sm:p-8 md:p-12 lg:p-20 flex justify-center items-center font-inter">
      <section className="text-white w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-blue-400">
          Decentralized KYC Registration
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-gray-400 text-lg mb-4">Step 1 of 2: Enter Personal & Contact Details</p>
  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
  <div
    className="h-full bg-[#8C2A8F] transition-all duration-300"
    style={{ width }} // ← set progress dynamically
  ></div>
</div>
          <aside className="p-6 border border-[#71627A] rounded-2xl flex flex-col gap-5">
            <h2 className="text-xl font-semibold">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={formData.fullName} action={handleChange} />
              <Input label="Date of Birth" name="dob" type="date" placeholder="mm/dd/yyyy" value={formData.dob} action={handleChange} />
              <div className="flex flex-col w-full">
                <label htmlFor="govIdType" className="text-sm mb-2 text-gray-300">Government ID Type</label>
                <select
                  id="govIdType"
                  name="govIdType"
                  value={formData.govIdType}
                  onChange={handleChange}
                  className="w-full bg-[#424242] text-white py-3 px-5 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#71627A] transition duration-150"
                >
                  <option value="" disabled>Select ID Type</option>
                  <option value="NIN">NIN (National ID)</option>
                  <option value="Driver’s License">Driver’s License</option>
                  <option value="Voter’s Card">Voter’s Card</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <Input label="ID Number" name="govIdNumber" placeholder="Enter Government ID number" value={formData.govIdNumber} action={handleChange} />
            </div>
          </aside>

          <aside className="p-6 border border-[#71627A] rounded-2xl flex flex-col gap-5">
            <h2 className="text-xl font-semibold">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Email Address" name="email" type="email" placeholder="Enter your email" value={formData.email} action={handleChange} />
              <Input label="Phone Number" name="phone" type="tel" placeholder="+234..." value={formData.phone} action={handleChange} />
            </div>
            <Input label="Residential Address" name="residentialAddress" placeholder="Enter your full home address" value={formData.residentialAddress} action={handleChange} />
            <Input label="Wallet Address (Detected)" name="walletAddress" placeholder="Connect wallet to display address" value={formData.walletAddress} action={handleChange} />
          </aside>

          <div className="flex justify-between items-center">
            <button className="px-[24px] py-[10px] bg-[#BDBDBD] rounded-full"  disabled={progress === 1} onClick={()=>handleProgress(1)}>
              Back
            </button>
            <button className="bg-[#8C2A8F] px-[24px] py-[10px] rounded-full" disabled={progress === 2} onClick={()=>handleProgress(2)}>Next</button>
          </div>
          <button
            type="submit"
            disabled={loading || !address}
            className={`mt-8 px-6 py-4 rounded-xl w-full text-lg font-bold transition duration-300 
              ${loading || !address
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit KYC & Encrypt Data to Blockchain'
            )}
          </button>

          {/* {statusMessage && (
            <div className={`mt-4 p-3 rounded-lg text-center font-medium ${statusMessage.startsWith('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              {statusMessage}
            </div>
          )} */}

          {txHash && (
            <p className="mt-4 text-sm text-center text-green-400 break-all">
              Mock Transaction Hash: <span className="font-mono">{txHash}</span>
            </p>
          )}

          <p className="text-xs text-center text-gray-500 mt-4">
            Current Wallet Address: {address || 'Not Connected'}
          </p>
        </form>
      </section>

    </div>
    {
      progress === 2 &&
    <div className="min-h-screen bg-[#000306] p-4 sm:p-8 md:p-12 lg:p-20 flex justify-center items-center font-inter">
                <FaceCapture/>

      </div>
    }
</>
  );
};


export default UserAuth;
