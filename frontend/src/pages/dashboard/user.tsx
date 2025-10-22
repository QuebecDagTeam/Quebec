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
interface ITABLE {
  appName:string;
  date:any;
  status:string
}
export const Dash = () => {
  const { address } = useAccount();
  const { user } = useUser();
  const navigate = useNavigate();

  const [Data, setDecryptedData] = useState<KYCData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [show, setShow] = useState<boolean>(false);
  const [tableData, setTableData] = useState<ITABLE[]>([]);

  useEffect(() => {
    if (!user?.role || !user?.token) {
      navigate("/sign_in");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchKYCData = async () => {
      if (!address || !user?.token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `https://quebec-ur3w.onrender.com/api/kyc/user/${address}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch KYC data");

        const data = await response.json();
        console.log("Fetched KYC:", data);

        setId(data?.kycDetails?.uniqueId || null);
        setTableData(data?.thirdarty || []); // ✅ handle if null or undefined
        const decrypted = decryptData(data?.kycDetails?.encryptedData);
        setDecryptedData(decrypted);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchKYCData();
  }, [address, user?.token]);

  return (
    <>
      {/* Notification overlay */}
      {show && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50"
          onClick={() => setShow(false)}
        >
          <div
            className={`mt-20 w-[90%] md:w-[400px] bg-[#1f1f1f] rounded-xl shadow-lg transition-all duration-500 ease-in-out`}
            onClick={(e) => e.stopPropagation()}
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
            <h1 className="text-2xl lg:text-3xl font-semibold gradient-text">
              Welcome {Data?.fullName || "User"}
            </h1>
            <button onClick={() => setShow(true)}>
              <FaBell size={28} />
            </button>
          </div>

          {/* Handle Global Loading/Error */}
          {loading && (
            <div className="mt-10 text-center text-gray-400 animate-pulse">
              Fetching your data...
            </div>
          )}
          {error && (
            <div className="mt-10 text-center text-red-500">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && (
            <>
              {/* KYC Profile Section */}
              <section className="flex flex-col lg:flex-row gap-10 mt-10">
                {/* Profile Card */}
                <div className="bg-[#2F2F2F] rounded-lg p-6 flex-1">
                  <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-[#5FFF92] font-medium">Wallet Address</p>
                      <small className="md:text-sm text-[10px] ">{address}</small>
                    </div>
                    <div>
                      <p className="text-sm text-[#5FFF92] font-medium">Unique ID</p>
                      <p className="text-sm ">{id || "N/A"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <img
                      src={Data?.image}
                      className="w-[100px] h-[100px] rounded-full object-cover"
                      alt="User"
                    />
                    <button className="me px-4 py-2 rounded text-sm">Edit Profile</button>
                  </div>

                  <div>
                    <p className="font-semibold mb-4">Stored KYC Data</p>
                    <div className="space-y-4">
                      <Input placeholder="" label="Full Name" value={Data?.fullName || ""} name="fullName" action={() => {}} />
                      <Input placeholder="" label="Date of Birth" value={Data?.dob || ""} name="dob" action={() => {}} />
                      <Input placeholder="" label="Email" value={Data?.email || ""} name="email" action={() => {}} />
                      <Input placeholder="" label="ID Type" value={Data?.ID?.type || ""} name="idType" action={() => {}} />
                      <Input placeholder="" label="ID Number" value={Data?.ID?.number || ""} name="idNumber" action={() => {}} />
                      <Input placeholder="" label="Phone" value={Data?.phone || ""} name="phone" action={() => {}} />
                      <Input placeholder="" label="Address" value={Data?.residentialAddress || ""} name="residentialAddress" action={() => {}} />
                    </div>
                  </div>
                </div>

                {/* Access Management */}
                <div className="bg-[#2F2F2F] rounded-lg p-6 w-full lg:w-1/3">
                  <p className="text-lg font-semibold mb-4">Access Management</p>
                  <p className="text-sm text-gray-400">Manage third-party access permissions.</p>
                </div>
              </section>

              {/* Access History Table */}
              <section>
                <p className="mt-10 text-lg font-semibold">Access History</p>
                <div className="overflow-x-auto mt-8 pb-20">
                  {tableData.length === 0 ? (
                    <p className="text-gray-400 text-center py-5">No access history found.</p>
                  ) : (
                    <table className="min-w-full text-sm text-left rounded overflow-hidden">
                      <thead className="bg-[#424242] text-white">
                        <tr>
                          <th className="px-4 py-3">App Name</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.map((row, i) => (
                          <tr key={i} className="bg-[#6A5F5F33] border-b border-[#333]">
                            <td className="px-4 py-3">{row.appName}</td>
                            <td className="px-4 py-3">{new Date(row.date).toLocaleDateString()}</td>
                            <td
                              className={`px-4 py-3 font-semibold ${
                                row.status === "Granted"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {row.status}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className={`font-semibold ${
                                  row.status === "Granted"
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-green-500 hover:text-green-600"
                                }`}
                              >
                                {row.status === "Granted" ? "Revoke access" : "Grant access"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          )}
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
