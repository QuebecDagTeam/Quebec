import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { encryptData } from "../../components/encrypt";
import { Input } from "../../components/input";
import FaceCapture from "../../components/faceCapture";
import { Link, useNavigate } from "react-router-dom";
import uploadToCloudinary from "../../services/cloudinary";
import { useQuebecKYC } from "../../services/contract";

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
  image: string;
  password: string;
  confirmPsw: string;
}

export const SignUpUser: React.FC = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    dob: "",
    govIdType: "",
    NIN: "",
    phone: "",
    walletAddress: "",
    residentialAddress: "",
    image: "",
    password: "",
    confirmPsw: "",
  });

  const [progress, setProgress] = useState(1);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);

  const { registerUser } = useQuebecKYC();

  const handleProgress = (step: number) => setProgress(step);

  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, walletAddress: address }));
      checkWalletRegistration(address);
    } else {
      setIsRegistered(null);
    }
  }, [address]);

  useEffect(() => {
    if (isConnected && isRegistered === true && !checkingRegistration) {
      navigate("/sign_in");
    }
  }, [isConnected, isRegistered, checkingRegistration, navigate]);

  const checkWalletRegistration = async (walletAddress: string) => {
    try {
      setCheckingRegistration(true);
      const response = await fetch(
        `https://quebec-ur3w.onrender.com/api/kyc/auth/isRegistered/${walletAddress}`
      );
      const data = await response.json();
      if (!data) {
        alert("Error checking registration status, check your connection.");
        return;
      }
      setIsRegistered(data?.registered);
    } catch (err) {
      console.error("Failed to check wallet registration:", err);
      setIsRegistered(false);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value || "" }));
  };

  const handleFaceCapture = (image: string) => {
    setFormData((prev) => ({ ...prev, image }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    const requiredFields: (keyof FormData)[] = [
      "fullName",
      "email",
      "dob",
      "govIdType",
      "NIN",
      "phone",
      "residentialAddress",
      "image",
      "password",
      "confirmPsw",
    ];

    const missingFields = requiredFields.filter((f) => !formData[f]);
    if (missingFields.length > 0) {
      console.error("Missing fields:", missingFields);
      alert(`Please fill in all fields. Missing: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.password !== formData.confirmPsw) {
      console.error("Passwords do not match");
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    setProgressMsg("Uploading image to Cloudinary...");

    try {
      // Step 1 - Upload to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(formData.image);
      console.log("✅ Cloudinary upload success:", cloudinaryUrl);
      setProgressMsg("Encrypting your information...");

      // Step 2 - Encrypt data
      const updatedFormData = { ...formData, image: cloudinaryUrl };
      const encryptedBase64 = encryptData(updatedFormData);
      const encryptedHex = base64ToHex(encryptedBase64);
      console.log("✅ Encryption successful");
      setProgressMsg("Submitting to blockchain network...");

      // Step 3 - Blockchain registration
      const txHash = await registerUser(encryptedHex);
      console.log("✅ Blockchain TX Hash:", txHash);
      setTxHash(txHash);
      setProgressMsg("Finalizing registration with backend...");

      // Step 4 - Send to backend
      const response = await fetch(
        "https://quebec-ur3w.onrender.com/api/auth/kyc/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: updatedFormData.email,
            NIN: updatedFormData.NIN,
            walletAddress: address,
            encryptedData: encryptedBase64,
            transactionHash: txHash,
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errText}`);
      }

      console.log("✅ Backend registration successful!");
      alert("✅ KYC submitted successfully!");
      setIsRegistered(true);
    } catch (err: any) {
      console.error("🔥 KYC submission failed:", err);
      setError(err.message || "Unknown error occurred");
      alert("❌ Error submitting KYC: " + err.message);
    } finally {
      setProgressMsg("");
      setLoading(false);
    }
  };

  // Global JS error listener
  useEffect(() => {
    window.onerror = (msg, url, line, col, error) => {
      console.error("🧨 Global JS Error:", { msg, url, line, col, error });
    };
    window.onunhandledrejection = (event) => {
      console.error("🚨 Unhandled Promise Rejection:", event.reason);
    };
  }, []);

  const progressWidth = progress === 1 ? "50%" : "100%";

  return (
    <section className="min-h-screen bg-[#000306] font-inter relative">
      <div className="container mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
        {/* Overlay for registration status */}
        {(checkingRegistration || isRegistered === null) && isConnected && (
          <div className="fixed inset-0 bg-black bg-opacity-80 text-white z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#8C2A8F] mx-auto" />
              <p className="text-xl font-semibold">
                Checking registration status...
              </p>
            </div>
          </div>
        )}

        {/* Progress overlay during submission */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-80 text-white z-50 flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#8C2A8F]" />
            <p className="text-lg font-semibold">{progressMsg}</p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="fixed top-5 right-5 bg-red-600 text-white p-3 rounded-lg shadow-lg z-50">
            <p className="font-bold">⚠️ Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Main form */}
        {isConnected && isRegistered === false && (
          <>
            {progress === 1 && (
              <>
                <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-[#8C2A8F]">
                  Decentralized KYC Registration
                </h1>
                <p className="text-gray-400 text-lg mb-4 text-center">
                  Step {progress} of 2:{" "}
                  {progress === 1
                    ? "Enter Personal & Contact Details"
                    : "Facial Verification"}
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

            <form
              onSubmit={handleSubmit}
              className="w-full max-w-4xl mx-auto space-y-8"
            >
              {progress === 1 && (
                <div className="text-white">
                  <aside className="p-6 border border-[#71627A] rounded-2xl mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                      Personal Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        action={handleChange}
                      />
                      <Input
                        label="Date of Birth"
                        name="dob"
                        type="date"
                        placeholder="mm/dd/yyyy"
                        value={formData.dob}
                        action={handleChange}
                      />
                      <div className="flex flex-col">
                        <label
                          htmlFor="govIdType"
                          className="text-sm mb-2 text-gray-300"
                        >
                          Government ID Type
                        </label>
                        <select
                          id="govIdType"
                          name="govIdType"
                          value={formData.govIdType}
                          onChange={handleChange}
                          className="w-full bg-[#424242] text-white py-3 px-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71627A]"
                        >
                          <option value="" disabled>
                            Select ID Type
                          </option>
                          <option value="NIN">NIN (National ID)</option>
                          <option value="Driver’s License">
                            Driver’s License
                          </option>
                          <option value="Voter’s Card">Voter’s Card</option>
                          <option value="Passport">Passport</option>
                        </select>
                      </div>
                      <Input
                        label="ID Number"
                        name="NIN"
                        placeholder="Enter Government ID number"
                        value={formData.NIN}
                        action={handleChange}
                      />
                    </div>
                  </aside>

                  <aside className="p-6 border border-[#71627A] rounded-2xl">
                    <h2 className="text-xl font-semibold mb-4">
                      Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        action={handleChange}
                      />
                      <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        placeholder="+234..."
                        value={formData.phone}
                        action={handleChange}
                      />
                    </div>
                    <div className="mt-6">
                      <Input
                        label="Residential Address"
                        name="residentialAddress"
                        placeholder="Enter your full home address"
                        value={formData.residentialAddress}
                        action={handleChange}
                      />
                    </div>
                    <div className="mt-6">
                      <Input
                        label="Wallet Address (Detected)"
                        name="walletAddress"
                        placeholder="Connect wallet to display address"
                        value={formData.walletAddress}
                        action={handleChange}
                      />
                    </div>
                  </aside>
                </div>
              )}

              {progress === 2 && (
                <div className="text-white">
                  <div className="py-5">
                    <p className="text-[26px] font-[600] text-[#8C2A8F] mb-2">
                      Facial Verification
                    </p>
                    <p>
                      Let’s verify it’s you. Position your head within the frame
                      and hold still while we scan.
                    </p>
                  </div>
                  <div className="flex gap-8 md:flex-row flex-col items-center justify-center md:px-0 px-5">
                    <FaceCapture onCapture={handleFaceCapture} />
                  </div>
                  <div className="mt-6">
                    <Input
                      label="Password"
                      name="password"
                      placeholder="************"
                      value={formData.password}
                      action={handleChange}
                    />
                    <Input
                      label="Confirm Password"
                      name="confirmPsw"
                      placeholder="************"
                      value={formData.confirmPsw}
                      action={handleChange}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center md:gap-4">
                <button
                  type="button"
                  className={`${
                    progress == 1
                      ? "bg-[#BDBDBD]"
                      : "bg-[#8C2A8F] text-white"
                  } px-6 py-3 rounded-full font-medium`}
                  disabled={progress === 1}
                  onClick={() => handleProgress(1)}
                >
                  Back
                </button>
                <button
                  type="button"
                  className={`${
                    progress == 1
                      ? "bg-[#8C2A8F]"
                      : "bg-gray-300 text-black"
                  } px-6 py-3 rounded-full font-medium`}
                  disabled={progress === 2}
                  onClick={() => handleProgress(2)}
                >
                  Next
                </button>
              </div>

              <div className="flex items-center justify-center w-full">
                <button
                  type="submit"
                  disabled={loading || !address || progress === 1}
                  className={`mt-8 w-full px-6 py-4 rounded-xl text-lg font-bold transition duration-300 
                  ${
                    loading || !address || progress !== 2
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#8C2A8F] text-white shadow-lg"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Submitting...
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>

              {txHash && (
                <p className="mt-4 text-sm text-center text-green-400 break-all">
                  Transaction Hash: <span className="font-mono">{txHash}</span>
                </p>
              )}
            </form>
          </>
        )}

        {isConnected && isRegistered === true && !checkingRegistration && (
          <div className="text-center text-white py-20">
            <h2 className="text-3xl font-bold text-green-400 mb-4">
              ✅ You have already completed KYC
            </h2>
            <p className="text-gray-400">
              You can visit your <Link to="/user/dashboard">dashboard</Link>.
            </p>
          </div>
        )}

        {!isConnected && (
          <div className="text-center text-white py-20">
            <h2 className="text-2xl font-semibold">
              🔌 Please connect your wallet to continue.
            </h2>
          </div>
        )}
      </div>
    </section>
  );
};

export default SignUpUser;
