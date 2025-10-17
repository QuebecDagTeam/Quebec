import { Link } from "react-router-dom";
import Logo from "../../assets/logo.jpg";
// import { FaSearch } from "react-icons/fa";
import { MdMoreHoriz } from "react-icons/md";
import { ConnectButton } from "../../components/connectBTN";
import { useAccount } from "wagmi";

export const NavBar = () => {
  const {  address, isConnected } = useAccount();

  return (
    <nav className="bg-[#000306] flex items-center justify-between px-5 md:px-10 lg:px-16 py-3 sticky top-0 left-0 w-full z-50 overflow-hidden">
      {/* Left - Logo + Nav Links */}
      <div className="flex items-center gap-4 md:gap-8">
        <img
          src={Logo}
          alt="Logo"
          className="h-[50px] w-[50px] md:h-[58px] md:w-[58px] rounded-full object-cover"
        />
        <ul className="hidden md:flex gap-6 lg:gap-10 text-white font-medium flex-wrap">
          <li><Link to="/" className="hover:text-[#8C2A8F] transition">Home</Link></li>
          <li><Link to="/kycs" className="hover:text-[#8C2A8F] transition">Dashboard</Link></li>
          <li><Link to="/messages" className="hover:text-[#8C2A8F] transition">SignIn</Link></li>
          <li><Link to="/notifications" className="hover:text-[#8C2A8F] transition">Notifications</Link></li>
        </ul>
      </div>

      {/* Center - Search bar */}
      <div className="flex items-center gap-2 w-[180px] sm:w-[220px] lg:w-[260px] px-3 py-[8px] md:py-[12px]  justify-center items-center py-5 rounded-[10px] ">
        {/* <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none text-sm text-black w-2/3"
        /> */}
        {/* <FaSearch className="text-[#8C2A8F]" /> */}
        {
          !isConnected ? (<ConnectButton/>) :
            <p className="text-white text-sm">
          Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
         </p> 
        }
      </div>

      {/* Right - Mobile icon */}
      <div className="text-white md:hidden">
        <MdMoreHoriz size={28}/>
      </div>
    </nav>
  );
};
