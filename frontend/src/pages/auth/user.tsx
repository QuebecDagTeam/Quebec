import React, { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import axios from "axios";
import { abi } from "../../constants/abi";
import { encryptData } from "../../components/encrypt";
import { Input } from "../../components/input";

const DAGKYC_CONTRACT = import.meta.env.VITE_CONTRACT_ADDRESS

function base64ToHex(base64: string): `0x${string}` {
  const raw = atob(base64);
  let hex = "";
  for (let i = 0; i < raw.length; i++) {
    const h = raw.charCodeAt(i).toString(16).padStart(2, "0");
    hex += h;
  }
  return `0x${hex}` as `0x${string}`;
}

export const UserAuth = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    dob: "",
    govIdType: "",
    govIdNumber: "",
    phone: "",
    walletAddress: "",
    residentialAddress: "",
  });

  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert("Please connect your wallet first.");
    setLoading(true);

    try {
      const encryptedBase64 = encryptData(formData);
      const encryptedHex = base64ToHex(encryptedBase64);

      const hash = await writeContractAsync({
        address: DAGKYC_CONTRACT as `0x${string}`,
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

  return (
    <section className="bg-[#000306] text-white p-20  w-full ">
      <form onSubmit={handleSubmit}>
        <p className="text-gray-400 mb-2">Step 1 of 2</p>
        <aside className="py-5 border-1 border-[#71627A] px-5 rounded-[35px] flex gap-5 flex-col mb-5">
        <h2 className="text-2xl font-semibold mb-4">Personal Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <Input
            label="Date of Birth"
            placeholder="mm/dd/yyyy"
            value={formData.dob}
            action={()=>handleChange}
          /> */}
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.fullName}
            action={()=>handleChange}
          />

          {/* Government ID with Select */}
          <div className="flex flex-col">
            <label className="text-sm mb-5">Government ID</label>
            <div className="flex gap-2">
              <select
                name="govIdType"
                value={formData.govIdType}
                onChange={handleChange}
                className="w-[586px] bg-[#424242] py-5 rounded-full px-5"
              >
                <option value="">Select ID Type</option>
                <option value="NIN">NIN</option>
                <option value="Driver’s License">Driver’s License</option>
                <option value="Voter’s Card">Voter’s Card</option>
                <option value="Passport">Passport</option>
              </select>
             
            </div>
          </div>

          <Input
            label="ID Number"
                placeholder="Enter ID number"
                value={formData.govIdNumber || ''}
                action={()=>{handleChange}}
          />
           <Input
            label="Date of Birth"
            placeholder="mm/dd/yyyy"
            value={formData.dob}
            action={()=>handleChange}
          />
        </div>
       <div className="w-full">
        
       </div>
      </aside>
        {/* Contact Info */}
        <aside className="py-5 border-1 border-[#71627A] px-5 rounded-[35px] flex gap-5 flex-col">
        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            action={()=>handleChange}
          />
          <Input
            label="Phone Number"
            placeholder="+234..."
            value={formData.phone}
            action={()=>handleChange}
          />
          
        </div>
        <div className="w-full">
            <Input
            label="Residential Address"
            placeholder="Enter your home address"
            value={formData.residentialAddress}
            action={()=>handleChange}
          />
        </div>
        </aside>
        <button
          type="submit"
          disabled={loading}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full"
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>

        {txHash && (
          <p className="mt-4 text-sm text-green-400">
            ✅ Transaction submitted: {txHash}
          </p>
        )}
      </form>
    </section>
  );
};
