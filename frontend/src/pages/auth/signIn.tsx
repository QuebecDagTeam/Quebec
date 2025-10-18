import { useEffect, useState } from "react";
import { Input } from "../../components/input";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { useUser } from "../../contexts/UserContext"; // adjust path if needed

interface FormData {
  walletAddress: string;
  password: string;
}

interface DecodedToken {
  id: string;
  walletAddress: string;
  role: string;
  exp: number;
  iat: number;
}

export const SignIn: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { address} = useAccount();
  const [formData, setFormData] = useState<FormData>({
    walletAddress: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useUser(); // from context

  useEffect(() => {
    if (address) {
      setFormData((prev) => ({ ...prev, walletAddress: address }));
    }
  }, [address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    setError(null);

    if (!formData.walletAddress || !formData.password) {
      setError("Wallet address and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("https://quebec-ur3w.onrender.com/api/kyc/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      const { token } = data;

      // Decode token
      const decoded: DecodedToken = jwtDecode(token);

      // Save to context + localStorage
      console.log(decoded)
      login({
        id: decoded.id,
        walletAddress: decoded.walletAddress,
        role: decoded.role,
        token,
      });

      navigate(`/${decoded?.role}/dashboard"`);
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#000306] font-inter flex flex-col items-center justify-center">
      <h2 className="text-[#8C2A8F] text-[26px] font-[600] px-5 mb-10">Sign In</h2>
      <p className="text-white text-[18px] font-[600] px-5">Enter Password to Continue Signing in</p>

      <div className="w-full md:w-[50%] mt-5 px-5 lg:w-[1/2]">
        <Input
          label="Wallet Address (Detected)"
          name="walletAddress"
          placeholder="Connect wallet to display address"
          value={formData.walletAddress}
          action={handleChange}
        />
        <Input
          label="Password"
          name="password"
          placeholder="************"
          value={formData.password}
          action={handleChange}
          type="password"
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <div className="flex items-center justify-center w-full md:w-[50%] px-5">
        <button
          onClick={handleLogin}
          disabled={loading || !address}
          className={`mt-8 w-full px-6 py-4 rounded-xl text-lg font-bold transition duration-300 
          ${loading || !address
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-[#8C2A8F] text-white shadow-lg"
            }`}
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
            "Submit"
          )}
        </button>
      </div>
    </section>
  );
};

export default SignIn;
