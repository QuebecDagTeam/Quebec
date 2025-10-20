import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
// import { encryptData } from "../../components/encrypt";
import { Input } from "../../components/input";
import { Link, useNavigate } from "react-router-dom";
import { useQuebecKYC } from "../../services/contract"; // like in user signup
import { useUser } from "../../contexts/UserContext";

// function base64ToHex(base64: string): `0x${string}` {
//   const raw = atob(base64);
//   let hex = "";
//   for (let i = 0; i < raw.length; i++) {
//     const h = raw.charCodeAt(i).toString(16).padStart(2, "0");
//     hex += h;
//   }
//   return `0x${hex}`;
// }

interface FormData {
  appName: string;
  detail: string;
  description: string;
  website: string;
  walletAddress: string;
  password: string;
  confirmPsw: string;
}

export const SignUpThirdParty: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { registerThirdParty } = useQuebecKYC(); // ✅ custom contract hook (registerThirdParty)
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    appName: "",
    detail: "",
    description: "",
    website: "",
    walletAddress: "",
    password: "",
    confirmPsw: "",
  });

  const [txHash, setTxHash] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [checkingRegistration, setCheckingRegistration] = useState(false);
  const [progressStatus, setProgressStatus] = useState("Idle");

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
      const response = await fetch(
        `https://quebec-ur3w.onrender.com/api/kyc/auth/isRegistered_thirdParty/${walletAddress}`
      );
      const data = await response.json();
      setIsRegistered(data?.registered);
      if (!data) {
        alert("Error checking registration status, please try again.");
        return;
      }
    } catch (err) {
      console.error("Failed to check wallet registration:", err);
      setIsRegistered(false);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value || "" }));
  };
  const { login } = useUser(); // from context

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!address) {
      alert("Please connect your wallet first.");
      return;
    }

    // basic validation
    const requiredFields: (keyof FormData)[] = [
      "appName",
      "description",
      "website",
      "password",
      "confirmPsw",
    ];

    const missingFields = requiredFields.filter((f) => !formData[f]);
    if (missingFields.length > 0) {
      alert(`Missing fields: ${missingFields.join(", ")}`);
      return;
    }

    if (formData.password !== formData.confirmPsw) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    setProgressStatus("Encrypting third party data...");

    try {
      // remove password before encryption
      // const { password, confirmPsw, } = formData;
      // const encryptedBase64 = encryptData(safeData);
      // const encryptedHex = base64ToHex(encryptedBase64);

      // send to blockchain
      setProgressStatus("Registering on blockchain...");
      const hash = await registerThirdParty(); // ✅ custom contract fn
      setTxHash(hash ?? null);

      // send to backend
      setProgressStatus("Saving to backend...");
      const response = await fetch(
        "https://quebec-ur3w.onrender.com/api/kyc/auth/register_thirdparty",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appName: formData.appName,
            detail: formData.detail,
            description: formData.description,
            website: formData.website,
            walletAddress: formData.walletAddress,
            transactionHash: hash,
            password: formData.password, // only sent to backend
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      alert("✅ Third Party Registered successfully!");
      setIsRegistered(true);
            login({
        id: '',
        walletAddress: formData.walletAddress,
        role: "user",
        token:'',
      });
      navigate(`/third_party/dashboard`);

    } catch (err: any) {
      console.error("❌ Third Party registration failed:", err);
      alert("Error submitting registration: " + err.message);
    } finally {
      setLoading(false);
      setProgressStatus("Idle");
    }
  };

  // navigate when done
  useEffect(() => {
    if (isConnected && isRegistered === true && !checkingRegistration) {
      navigate("/sign_in");
    }
  }, [isConnected, isRegistered, checkingRegistration]);

  return (
    <section className="min-h-screen bg-[#000306] font-inter relative">
      <div className="container mx-auto p-4 sm:p-8 md:p-12 lg:p-20">
        {(checkingRegistration || isRegistered === null) && isConnected && (
          <div className="fixed inset-0 bg-black bg-opacity-80 text-white z-50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#3333ff] mx-auto" />
              <p className="text-xl font-semibold">Checking registration status...</p>
            </div>
          </div>
        )}

        {isConnected && isRegistered === false && (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-[#3333ff]">
              Register Your Third Party App
            </h1>

            <form
              onSubmit={handleSubmit}
              className="w-full rounded-2xl max-w-4xl mx-auto space-y-8 border-2 border-[#3333ff] p-6"
            >
              <div className="text-white">
                <h2 className="text-xl font-semibold mb-4">App Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="App Name"
                    name="appName"
                    placeholder="e.g., DeFi Analytics Pro"
                    value={formData.appName}
                    action={handleChange}
                  />
                  <Input
                    label="Description"
                    name="description"
                    placeholder="Describe your app"
                    value={formData.description}
                    action={handleChange}
                  />
                  <Input
                    label="Website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    action={handleChange}
                  />
                  <Input
                    label="Additional Details"
                    name="detail"
                    placeholder="Optional integration info"
                    value={formData.detail}
                    action={handleChange}
                  />
                </div>

                <div className="mt-8">
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

                <p className="text-xs text-center text-gray-500 mt-4">
                  Current Wallet Address: {address || "Not Connected"}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !address}
                className={`mt-8 w-full px-6 py-4 rounded-xl text-lg font-bold transition duration-300 
                  ${
                    loading || !address
                      ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-[#3333ff] text-white shadow-lg shadow-bg-[#3333ff]"
                  }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>

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
              ✅ You have already completed Third Party Registration
            </h2>
            <p className="text-gray-400">
              No further action is required. You might want to go to{" "}
              <Link to="/thirdparty/dashboard" className="underline text-[#3333ff]">
                dashboard
              </Link>
              .
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

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center text-white z-[9999]">
          <div className="bg-[#1f1f1f] px-8 py-6 rounded-2xl shadow-lg text-center space-y-4">
            <h3 className="text-lg font-semibold animate-pulse">
              {progressStatus}
            </h3>
            <div className="w-64 bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#3333ff] h-full transition-all duration-500"
                style={{
                  width: progressStatus.includes("Encrypting")
                    ? "40%"
                    : progressStatus.includes("Registering")
                    ? "70%"
                    : progressStatus.includes("Saving")
                    ? "90%"
                    : progressStatus.includes("✅")
                    ? "100%"
                    : "20%",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SignUpThirdParty;
