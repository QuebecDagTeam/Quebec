import { useEffect, useState } from "react";
import { Input } from "../../components/input"
import { useAccount } from "wagmi";

interface FormData {
    
    walletAddress: string;
    password:string,
}
 export const SignIn: React.FC  = () =>{
    const [loading, ] = useState(false);
    const { address, } = useAccount();
    const [formData, setFormData] = useState<FormData>({
        walletAddress: "",
        password:"",
      });
      useEffect(() => {
        if (address) {
          setFormData((prev) => ({ ...prev, walletAddress: address }));
        //   checkWalletRegistration(address);
        } else {
        //   setIsRegistered(null);
        }
      }, [address]); 
      const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value || "" }));
      };
    return(
        <section className="min-h-screen bg-[#000306]  font-inter flex flex-col items-center justify-center ">
            <h2 className="text-[#8C2A8F] text-[26px] font-[600] px-5 mb-10">SignIn</h2>
            <p className="text-white text-[18px] font-[600] px-5">Enter Password to Continue Signing in</p>
            <div className="w-full md:w-[50%] mt-5 px-5 lg:w-[1/2]">
            <Input label="Wallet Address (Detected)" name="walletAddress" placeholder="Connect wallet to display address" value={formData.walletAddress} action={handleChange} />
            <Input label="Password" name="password" placeholder="************" value={formData.password} action={handleChange}/>
            {/*  / */}

            </div>

                          {/* Submit Button */}
                          <div className="flex items-center justify-center w-full md:w-[50%] px-5">
              <button type="submit" disabled={loading || !address } className={`mt-8 w-full px-6 py-4 rounded-xl text-lg font-bold transition duration-300 
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

        </section>
    )
}

export default SignIn;
