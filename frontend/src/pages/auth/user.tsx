import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { abi } from "../../constants/abi";
import { encryptData } from "../../components/encrypt";
import { Input } from "../../components/input";
import FaceCapture from "../../components/faceCapture";
import { Link, Navigate, useNavigate } from "react-router-dom";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

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
  NIN: string;
  phone: string;
  walletAddress: string;
  residentialAddress: string;
}

export const UserAuth: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    dob: "",
    govIdType: "",
    NIN: "",
    phone: "",
    walletAddress: "",
    residentialAddress: "",
  });

  const [progress, setProgress] = useState(1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null); // null = unknown
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const handleProgress = (step: number) => setProgress(step);

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
      const response = await fetch(`https://quebec-ur3w.onrender.com/api/kyc/isRegistered/${walletAddress}`);
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
      const encryptedBase64 = encryptData(formData);
      const encryptedHex = base64ToHex(encryptedBase64);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "registerKyc",
        args: [address, encryptedHex],
      });

      setTxHash(hash);

      const response = await fetch("https://quebec-ur3w.onrender.com/api/kyc/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:formData.email,
          NIN:formData.NIN,
          walletAddress: address,
          encryptedData: encryptedBase64,
          transactionHash: hash,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      alert("✅ KYC submitted successfully!");
      setIsRegistered(true); // Optimistic update
    } catch (err) {
      console.error("KYC submission failed:", err);
      alert("❌ Error submitting KYC");
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = progress === 1 ? "50%" : "100%";
  const navigate = useNavigate()
  useEffect(()=>{
    isConnected && isRegistered === true && !checkingRegistration && 
    navigate('/user/dashboard');
  }, [isConnected, isRegistered, !checkingRegistration])
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

        {isConnected && isRegistered === false && (
          <>
            {progress === 1 && (
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-[#8C2A8F]">
                  Decentralized KYC Registration
                </h1>
                <p className="text-gray-400 text-lg mb-4 text-center">
                  Step {progress} of 2: {progress === 1 ? "Enter Personal & Contact Details" : "Facial Verification"}
                </p>
                <div className="flex items-center justify-center">
                  <div className="w-full h-4 bg-gray-200 max-w-4xl rounded-full overflow-hidden mb-10">
                    <div
                      className="h-full bg-[#8C2A8F] transition-all duration-300"
                      style={{ width: progressWidth }}
                    />
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-8">
              {progress === 1 && (
                <div className="text-white">
                  <aside className="p-6 border border-[#71627A] rounded-2xl mb-8">
                    <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Full Name" name="fullName" placeholder="Enter your full name" value={formData.fullName} action={handleChange} />
                      <Input label="Date of Birth" name="dob" type="date" placeholder="mm/dd/yyyy" value={formData.dob} action={handleChange} />
                      <div className="flex flex-col">
                        <label htmlFor="govIdType" className="text-sm mb-2 text-gray-300">Government ID Type</label>
                        <select
                          id="govIdType"
                          name="govIdType"
                          value={formData.govIdType}
                          onChange={handleChange}
                          className="w-full bg-[#424242] text-white py-3 px-5 rounded-full appearance-none focus:outline-none focus:ring-2 focus:ring-[#71627A] transition"
                        >
                          <option value="" disabled>Select ID Type</option>
                          <option value="NIN">NIN (National ID)</option>
                          <option value="Driver’s License">Driver’s License</option>
                          <option value="Voter’s Card">Voter’s Card</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <Input label="ID Number" name="govIdNumber" placeholder="Enter Government ID number" value={formData.NIN} action={handleChange} />
                    </div>
                  </aside>

                  <aside className="p-6 border border-[#71627A] rounded-2xl">
                    <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input label="Email Address" name="email" type="email" placeholder="Enter your email" value={formData.email} action={handleChange} />
                      <Input label="Phone Number" name="phone" type="tel" placeholder="+234..." value={formData.phone} action={handleChange} />
                    </div>
                    <div className="mt-6">
                      <Input label="Residential Address" name="residentialAddress" placeholder="Enter your full home address" value={formData.residentialAddress} action={handleChange} />
                    </div>
                    <div className="mt-6">
                      <Input label="Wallet Address (Detected)" name="walletAddress" placeholder="Connect wallet to display address" value={formData.walletAddress} action={handleChange} />
                    </div>
                  </aside>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    Current Wallet Address: {address || 'Not Connected'}
                  </p>
                </div>
              )}

              {progress === 2 && (
                <div>
                  <div className="py-5">
                    <p className="text-white text-[26px] font-[600]">Facial Verification</p>
                    <p className="text-white">Let’s verify it’s you. Position your head within the frame and hold still while we scan.</p>
                  </div>
                  <div className="flex gap-8 md:flex-row flex-col items-center justify-center">
                    <FaceCapture />
                    <div className="md:bg-[#2F2F2F] gap-2 md:gap-8 w-full md:w-1/3 px-[10px] md:px-[30px] py-[20px] flex-col rounded-[8px] flex items-center justify-center">
                      <div className="bg-[#424242] w-full h-auto text-white p-5 rounded-[15px]">
                        <p className="md:text-[18px] text-center">Good Lighting</p>
                        <p className="md:text-[14px] text-[12px] text-center ">Ensure you’re in a well lit area</p>
                      </div>
                      <div className="bg-[#424242] w-full h-auto text-white p-5 rounded-[15px]">
                        <p className="md:text-[18px] text-center">Stay Still</p>
                        <p className="md:text-[14px] text-[12px] text-center ">Minimize movement while scanning</p>
                      </div>
                      <div className="bg-[#424242] w-full h-auto text-white p-5 rounded-[15px]">
                        <p className="md:text-[18px] text-center">Face Visibility</p>
                        <p className="md:text-[14px] text-[12px] text-center ">Ensure your face is fully visible</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center md:gap-4">
                <button type="button" className={`${progress ==1 ? "bg-[#BDBDBD]":"bg-[#8C2A8F] text-white"} px-6 py-3  rounded-full text-black font-medium"`} disabled={progress === 1} onClick={() => handleProgress(1)}>Back</button>
                <button type="button" className={` ${progress ==1 ? "bg-[#8C2A8F]":"bg-gray-300 text-black"} px-6 py-3 rounded-full text-white font-medium"`} disabled={progress === 2} onClick={() => handleProgress(2)}>Next</button>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center w-full">
              <button type="submit" disabled={loading || !address || progress===1} className={`mt-8 w-full px-6 py-4 rounded-xl text-lg font-bold transition duration-300 
                ${loading || !address ||progress!==2 ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-[#8C2A8F] text-white shadow-lg shadow-bg-[#8C2A8F] '}`}>
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
            <p className="text-gray-400">No further action is required at this time. might want to go to  <Link to='/user/dashboard'>dashboard</Link></p>
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

export default UserAuth;
