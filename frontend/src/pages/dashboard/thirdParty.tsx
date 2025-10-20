import { MdNotifications } from "react-icons/md";
import Logo from "../../assets/logo.jpg";
import User from "../../assets/user.jpg";
import {
  MdDashboard,
  MdPerson,
  MdApps,
  MdHistory,
  MdSettings,
  MdSupport,
  MdLogout,
} from "react-icons/md";
import UserImg from "../../assets/user.jpg";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { decryptData } from "../../components/encrypt";
import { useAccount } from "wagmi";
import { useUser } from "../../contexts/UserContext";

interface KYCData {
  fullName: string;
  email: string;
  dob: string;
  govIdType: string;
  NIN: string;
  phone: string;
  walletAddress: string;
  residentialAddress: string;
}



const navItems = [
  { name: "Dashboard", icon: <MdDashboard size={24} />, path: "dashboard" },
  { name: "Identity", icon: <MdPerson size={24} />, path: "identity" },
  { name: "Apps", icon: <MdApps size={24} />, path: "apps" },
  { name: "History", icon: <MdHistory size={24} />, path: "history" },
  { name: "Settings", icon: <MdSettings size={24} />, path: "settings" },
  { name: "Support", icon: <MdSupport size={24} />, path: "support" },
];
export const ThirdPartyDash = () => {
      const { address } = useAccount();

  const [Data, setDecryptedData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKYCData = async () => {
      try {
        const response = await fetch(`https://quebec-ur3w.onrender.com/api/kyc/user/${address}`);

        if (!response.ok) {
          throw new Error('Failed to fetch KYC data');
        }

        const data = await response.json();

        // Decrypt the data
        const decrypted = decryptData(data.kycDetails.encryptedData);
        console.log("Decrypted Data:", decrypted);

        setDecryptedData(decrypted);
        console.log(Data)
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKYCData();
  }, [address]);


   const {user} = useUser();
      const navigate = useNavigate()
      useEffect(()=>{
        !user && navigate("/sign_in")
      })
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#000306] text-white">
      
      {/* Sidebar */}
      <Sidebar/>
      <MobileFooterNav/>

      {/* Main Content */}
      <main className="flex-1 mt-[5px] md:mt-[20px] lg:mt-0 w-full px-6 lg:px-5 py-10">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-semibold">Welcome </h1>
          <MdNotifications size={28} />
        </div>

        {/* Content Sections */}
        <section className="flex flex-col lg:flex-row gap-10 mt-10">
          
          {/* Profile Card */}
          <div className="bg-[#2F2F2F] rounded-lg p-6 flex-1">
            
            {/* Top Info */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-[#5FFF92] font-medium text-[12px]">Wallet Address</p>
                <p className="text-lg font-semibold text-[12px]">X44555</p>
              </div>
              <div>
                <p className="text-sm text-[#5FFF92] font-medium text-[12px]">Unique ID</p>
                <p className="text-lg font-semibold text-[12px]">X44555</p>
              </div>
            </div>

            {/* Profile Image + Button */}
            <div className="flex items-center justify-between mb-6">
              <img src={User} className="w-[100px] h-[100px] rounded-full object-cover" alt="User" />
              <button className="bg-[#8C2A8F] px-4 py-2 rounded text-sm">Edit Profile</button>
            </div>

            {/* KYC Form */}
          </div>
        
        </section>
        <section>
            <p>Access History</p>
            <div className="overflow-x-auto mt-8">
  <table className="min-w-full text-sm text-left rounded overflow-hidden">
    
    {/* Table Head */}
    <thead className="bg-[#424242] text-white">
      <tr>
        <th className="px-4 py-3">Application</th>
        <th className="px-4 py-3">Date</th>
        <th className="px-4 py-3">Time</th>
        <th className="px-4 py-3">Action</th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody className="text-white">
      <tr className="bg-[#6A5F5F33]">
        <td className="px-4 py-3">FinTech</td>
        <td className="px-4 py-3">15-08-2023</td>
        <td className="px-4 py-3">8:00 PM</td>
        <td className="px-4 py-3 text-red-500 font-semibold">Access Revoked</td>
      </tr>

      <tr className="bg-[#6A5F5F33]">
        <td className="px-4 py-3">E-commerce</td>
        <td className="px-4 py-3">15-08-2023</td>
        <td className="px-4 py-3">8:00 PM</td>
        <td className="px-4 py-3 text-green-500 font-semibold">Access Granted</td>
      </tr>

      <tr className="bg-[#6A5F5F33]">
        <td className="px-4 py-3">Social Media Platform</td>
        <td className="px-4 py-3">15-08-2023</td>
        <td className="px-4 py-3">8:00 PM</td>
        <td className="px-4 py-3 text-green-500 font-semibold">Access Granted</td>
      </tr>
    </tbody>
  </table>
</div>
{/* <KYCComponent userAddress="0x68c9313f05d95Ed6A0D3715EadDcCd35A81FDEc8"/>
<KYCDelete walletAddress="0x68c9313f05d95Ed6A0D3715EadDcCd35A81FDEc8"/> */}
        </section>
      </main>
    </div>
  );
};





export const Sidebar = () => {
  const [active, setActive] = useState("dashboard");

  return (
    <aside className="hidden md:flex md:flex-col bg-[#2F2F2F] text-white w-[260px] h-screen sticky top-0 left-0 overflow-y-auto">
      
      {/* Top: Logo + Navigation */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-4 px-6 py-6">
          <img src={Logo} className="w-[48px] h-[48px] rounded-full" alt="Logo" />
          <p className="text-[20px] font-semibold">QUEBEC</p>
        </div>

        {/* Nav Items */}
        <nav className="mt-4 px-5">
          {navItems.map((item) => (
            <Link
            to={`/${item.path}`}
              key={item.name}
              onClick={() => setActive(item.path)}
              className={`flex items-center gap-4 cursor-pointer eounded-[8px] md:px-4 lg:px-9 py-4 transition-all ${
                active === item.path ? "bg-[#8C2A8F] text-white" : "text-gray-300 hover:bg-[#3a3a3a]"
              }`}
            >
              {item.icon}
              <span className="text-[16px] font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom: User Info + Log Out */}
      <div className="px-6 pb-6">
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={UserImg}
            alt="User"
            className="w-[32px] h-[32px] rounded-full object-cover"
          />
          <p className="text-[15px] font-medium">Aisha Muhammad</p>
        </div>

        {/* Logout */}
        <div className="flex items-center gap-3 text-red-500 cursor-pointer hover:text-red-600 transition">
          <MdLogout size={20} />
          <span className="text-[15px] font-medium">Log Out</span>
        </div>
      </div>
    </aside>
  );
};



const mobileNavItems = [
  { name: "Dashboard", icon: <MdDashboard size={24} />, path: "dashboard" },
  { name: "Identity", icon: <MdPerson size={24} />, path: "identity" },
  { name: "Apps", icon: <MdApps size={24} />, path: "apps" },
  { name: "History", icon: <MdHistory size={24} />, path: "history" },
  { name: "Settings", icon: <MdSettings size={24} />, path: "settings" },
];

export const MobileFooterNav = () => {
  const [active, setActive] = useState("dashboard");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#2F2F2F] flex justify-between px-4 py-2 border-t border-[#444] z-50">
      {mobileNavItems.map((item) => (
        <button
          key={item.name}
          onClick={() => setActive(item.path)}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            active === item.path ? "text-white bg-[#8C2A8F] rounded-md" : "text-gray-400"
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
        </button>
      ))}
    </nav>
  );
};
