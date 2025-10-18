import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { encryptData, base64ToHex } from "../../components/encrypt";
import { useQuebecKYC } from "../../hooks/useQuebecKYC";

// helper function to upload image
const uploadToCloudinary = async (file: File): Promise<string> => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "quebec_preset");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
    { method: "POST", body: data }
  );
  const json = await res.json();

  if (!res.ok) throw new Error(json.error?.message || "Cloudinary upload failed");
  return json.secure_url;
};

// timeout helper
const timeout = (ms: number) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error("⏱️ Request timed out")), ms));

interface FormData {
  fullName: string;
  email: string;
  dob: string;
  govIdType: string;
  NIN: string;
  phone: string;
  residentialAddress: string;
  image: File | null;
  password: string;
  confirmPsw: string;
}

export default function SignUpUser() {
  const { address } = useAccount();
  const { registerUser } = useQuebecKYC();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    dob: "",
    govIdType: "",
    NIN: "",
    phone: "",
    residentialAddress: "",
    image: null,
    password: "",
    confirmPsw: "",
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("Idle");
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    window.onerror = (msg, url, line, col, error) => {
      console.error("🧨 Global JS Error:", { msg, url, line, col, error });
    };
    window.onunhandledrejection = (event) => {
      console.error("🚨 Unhandled Promise Rejection:", event.reason);
    };
  }, []);

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

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all fields. Missing: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.password !== formData.confirmPsw) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    setProgress("Uploading image...");

    try {
      const result = await Promise.race([
        (async () => {
          // STEP 1: Upload image
          const cloudinaryUrl = await uploadToCloudinary(formData.image!);
          setProgress("Encrypting data...");

          // STEP 2: Encrypt data
          const updatedFormData = { ...formData, image: cloudinaryUrl };
          const encryptedBase64 = encryptData(updatedFormData);
          const encryptedHex = base64ToHex(encryptedBase64);

          setProgress("Registering on blockchain...");
          const txHash = await registerUser(encryptedHex);
          setTxHash(txHash ?? null);

          setProgress("Sending data to backend...");
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
            const errorText = await response.text();
            console.error("❌ Backend Error:", errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
          }

          setProgress("✅ Registration successful!");
          setIsRegistered(true);
          alert("✅ KYC submitted successfully!");
        })(),
        timeout(60000), // 1-minute timeout
      ]);
    } catch (err: any) {
      console.error("🔥 Submission failed:", err);
      setError(err.message || "Unknown error occurred");
      alert(`❌ Error submitting KYC: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      setProgress("Done.");
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-semibold mb-6">User KYC Registration</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-full max-w-lg space-y-4"
      >
        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 border rounded"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="date"
          className="w-full p-3 border rounded"
          value={formData.dob}
          onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
        />
        <input
          type="text"
          placeholder="Government ID Type"
          className="w-full p-3 border rounded"
          value={formData.govIdType}
          onChange={(e) => setFormData({ ...formData, govIdType: e.target.value })}
        />
        <input
          type="text"
          placeholder="NIN"
          className="w-full p-3 border rounded"
          value={formData.NIN}
          onChange={(e) => setFormData({ ...formData, NIN: e.target.value })}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          className="w-full p-3 border rounded"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <textarea
          placeholder="Residential Address"
          className="w-full p-3 border rounded"
          value={formData.residentialAddress}
          onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          className="w-full p-3 border rounded"
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.files?.[0] || null })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-3 border rounded"
          value={formData.confirmPsw}
          onChange={(e) => setFormData({ ...formData, confirmPsw: e.target.value })}
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl text-white ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit KYC"}
        </button>
      </form>

      {/* Overlay progress */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white backdrop-blur-sm transition-all duration-300">
          <div className="bg-gray-800 px-6 py-4 rounded-xl shadow-lg text-center space-y-3 w-72">
            <div className="animate-pulse text-lg font-medium">{progress}</div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-400 h-full transition-all duration-700"
                style={{
                  width:
                    progress.includes("Uploading") ? "20%" :
                    progress.includes("Encrypting") ? "40%" :
                    progress.includes("Registering") ? "60%" :
                    progress.includes("Sending") ? "80%" :
                    progress.includes("✅") ? "100%" : "10%",
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-xl">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isRegistered && txHash && (
        <div className="mt-6 bg-green-100 text-green-700 p-3 rounded-xl">
          ✅ Registration successful!  
          <br />
          <small>Transaction Hash: {txHash}</small>
        </div>
      )}
    </div>
  );
}
