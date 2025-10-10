// src/pages/OnboardingPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConnectButton from "./connectBTN";


export default function OnboardingPage() {
  const [wallet, setWallet] = useState("");
  const [role, setRole] = useState<"user" | "thirdParty" | null>(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (role === "user") navigate("/user-dashboard");
    if (role === "thirdParty") navigate("/thirdparty-dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <ConnectButton/>
      <h2 className="text-2xl mt-6">Continue as:</h2>
      <div className="flex gap-4 mt-4">
        <button onClick={() => setRole("user")} className={`p-3 rounded-xl ${role === "user" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>User</button>
        <button onClick={() => setRole("thirdParty")} className={`p-3 rounded-xl ${role === "thirdParty" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>Third Party</button>
      </div>
      {role && wallet && (
        <button onClick={handleContinue} className="mt-6 bg-green-600 text-white p-3 rounded-lg">
          Continue
        </button>
      )}
    </div>
  );
}
