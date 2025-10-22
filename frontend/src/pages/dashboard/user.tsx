import Logo from "../../assets/logo.jpg";
import { Input } from "../../components/input";
import {
  MdDashboard,
  MdPerson,
  MdApps,
  MdHistory,
  MdSettings,
  MdSupport,
  MdLogout,
} from "react-icons/md";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { decryptData } from "../../components/encrypt";
import { useAccount } from "wagmi";
import { FaBell } from "react-icons/fa";
import { useUser } from "../../contexts/UserContext";
import { Notify } from "../notifications";

interface KYCData {
  fullName: string;
  email: string;
  dob: string;
  ID: {
    type: string;
    number: any;
  };
  NIN: string;
  phone: string;
  walletAddress: string;
  residentialAddress: string;
  image: string;
}

const navItems = [
  { name: "Dashboard", icon: <MdDashboard size={24} />, path: "dashboard" },
  { name: "Identity", icon: <MdPerson size={24} />, path: "identity" },
  { name: "Apps", icon: <MdApps size={24} />, path: "apps" },
  { name: "History", icon: <MdHistory size={24} />, path: "history" },
  { name: "Settings", icon: <MdSettings size={24} />, path: "settings" },
  { name: "Support", icon: <MdSupport size={24} />, path: "support" },
];

export const Dash = () => {
  const { address } = useAccount();
  const { user } = useUser();
  const navigate = useNavigate();

  const [Data, setDecryptedData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(false)
  useEffect(() => {
    if (!user?.role || !user?.token) {
      navigate("/sign_in");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchKYCData = async () => {
      if (!address || !user?.token) return;

      try {
        const response = await fetch(
          `https://quebec-ur3w.onrender.com/api/kyc/user/${address}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch KYC data");
        }

        const data = await response.json();
        setId(data?.kycDetails?.uniqueId || null);

        const decrypted = decryptData(data?.kycDetails?.encryptedData);
        setDecryptedData(decrypted);
        setLoading(false);
      } catch (error: any) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchKYCData();
  }, [address, user?.token]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;


  // const handleShow = () => {
  //   setShow(true)
  // }
  return (
    <>
   {show && (
  <div
    className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 overflow-hidden"
    onClick={() => setShow(false)} // close when clicking outside
  >
    <div
      className={`mt-20 w-[90%] md:w-[400px] bg-[#1f1f1f] rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 ease-in-out ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
      }`}
      onClick={(e) => e.stopPropagation()} // prevents close when clicking inside
    >
      <Notify />
    </div>
  </div>
)}

    <div className="flex flex-col md:flex-row min-h-screen bg-[#000306] text-white">
      {/* Sidebar */}
      <Sidebar name={Data?.fullName || ""} image={Data?.image || ""} />
      <MobileFooterNav />

      {/* Main Content */}
      <main className="flex-1 mt-[5px] md:mt-[20px] lg:mt-0 w-full px-6 lg:px-5 py-10">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl lg:text-3xl font-semibold gradient-text ">
            Welcome {Data?.fullName}
          </h1>
          <button onClick={()=>setShow(true)}>
            <FaBell size={28} />
          </button>
        </div>

        {/* KYC Profile Section */}
        <section className="flex flex-col lg:flex-row gap-10 mt-10">
          {/* Profile Card */}
          <div className="bg-[#2F2F2F] rounded-lg p-6 flex-1">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div>
                <p className="text-sm text-[#5FFF92] font-medium text-[12px]">
                  Wallet Address
                </p>
                <small className="text-sm font-semibold md:text-[12px] text-[10px]">{address}</small>
              </div>
              <div>
                <p className="text-sm text-[#5FFF92] font-medium text-[12px]">
                  Unique ID
                </p>
                <p className="text-lg font-semibold text-[12px]">{id || ""}</p>
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center justify-between mb-6">
              <img
                src={Data?.image}
                className="w-[100px] h-[100px] rounded-full object-cover"
                alt="User"
              />
              <button className="me px-4 py-2 rounded text-sm">
                Edit Profile
              </button>
            </div>

            {/* KYC Info */}
                        {/* KYC Form */}
            <div>
              <p className="font-semibold mb-4">Stored KYC Data</p>
              <div className="space-y-4">
                <Input label="Full Name" placeholder="Enter Full Name" value={Data?.fullName || ''} name="fullName" action={() => {}} />
                <Input label="Date of Birth" placeholder="Enter Date of Birth" value={Data?.dob || ''} name="dob" action={() => {}} />
                <Input label="Date of Birth" placeholder="Enter Date of Birth" value={Data?.email || ''} name="dob" action={() => {}} />
                <Input label="Government ID Type" placeholder="Enter Government ID Type" value={Data?.ID?.type || ''} name="govIdType" action={() => {}} />
                <Input label="Government ID Type" placeholder="Enter Government ID Type" value={Data?.ID?.number || ''} name="govIdType" action={() => {}} />
                <Input label="Government ID Type" placeholder="Enter Government ID Type" value={Data?.phone || ''} name="govIdType" action={() => {}} />
                <Input label="Government ID Type" placeholder="Enter Government ID Type" value={Data?.residentialAddress || ''} name="govIdType" action={() => {}} />
              </div>
            </div>
          </div>

          {/* Access Management */}
          <div className="bg-[#2F2F2F] rounded-lg p-6 w-full lg:w-1/3">
            <p className="text-lg font-semibold mb-4">Access Management</p>
            {/* Add access controls here */}
          </div>
        </section>

        {/* Access History */}
        <section>
          <p>Access History</p>
          <div className="overflow-x-auto mt-8 pb-20">
            <table className="min-w-full text-sm text-left rounded overflow-hidden">
              <thead className="bg-[#424242] text-white">
                <tr>
                  <th className="px-4 py-3">Application</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="bg-[#6A5F5F33]">
                  <td className="px-4 py-3">FinTech</td>
                  <td className="px-4 py-3">15-08-2023</td>
                  <td className="px-4 py-3">8:00 PM</td>
                  <td className="px-4 py-3 text-red-500 font-semibold">
                    Access Revoked
                  </td>
                </tr>
                <tr className="bg-[#6A5F5F33]">
                  <td className="px-4 py-3">E-commerce</td>
                  <td className="px-4 py-3">15-08-2023</td>
                  <td className="px-4 py-3">8:00 PM</td>
                  <td className="px-4 py-3 text-green-500 font-semibold">
                    Access Granted
                  </td>
                </tr>
                <tr className="bg-[#6A5F5F33]">
                  <td className="px-4 py-3">Social Media Platform</td>
                  <td className="px-4 py-3">15-08-2023</td>
                  <td className="px-4 py-3">8:00 PM</td>
                  <td className="px-4 py-3 text-green-500 font-semibold">
                    Access Granted
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
     </>
  );
};

interface ISide_Bar {
  name: string;
  image: string;
}

export const Sidebar = ({ name, image }: ISide_Bar) => {
  const [active, setActive] = useState("dashboard");
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
    login({
      id: "",
      walletAddress: "",
      role: "",
      token: "",
    });
  };

  return (
    <aside className="hidden md:flex md:flex-col bg-[#2F2F2F] text-white w-[260px] h-screen sticky top-0 left-0 overflow-y-hidden">
      <div>
        <div className="flex items-center gap-4 px-6 py-6">
          <img src={Logo} className="w-[48px] h-[48px] rounded-full" alt="Logo" />
          <p className="text-[20px] font-semibold">QUEBEC</p>
        </div>

        <nav className="mt-4 px-5">
          {navItems.map((item) => (
            <Link
              to={`/${item.path}`}
              key={item.name}
              onClick={() => setActive(item.path)}
              className={`flex items-center gap-4 rounded-[8px] md:px-4 lg:px-9 py-4 transition-all ${
                active === item.path
                  ? "me text-white"
                  : "text-gray-300 hover:bg-[#3a3a3a]"
              }`}
            >
              {item.icon}
              <span className="text-[16px] font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <div className="flex lg:flex-row flex-col items-start gap-3 mb-4">
          <img
            src={image}
            alt="User"
            className="w-[32px] h-[32px] rounded-full object-cover"
          />
          <p className="text-[15px] font-medium">{name}</p>
        </div>

        <div
          className="flex items-center gap-3 text-red-500 cursor-pointer hover:text-red-600 transition"
          onClick={handleLogout}
        >
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
            active === item.path ? "text-white me rounded-md" : "text-gray-400"
          }`}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
        </button>
      ))}
    </nav>
  );
};
