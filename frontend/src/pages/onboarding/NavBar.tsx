import { Link} from "react-router-dom";
import Logo from "../../assets/logo.jpg";
import { ConnectButton } from "../../components/connectBTN";
import { useState } from "react";
import { Overlay } from "./overlay";
import { FaTimes } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { useUser } from "../../contexts/UserContext";

export const NavBar = () => {
  // const { address, isConnected } = useAccount();
  const [showOverlay, setShowOverlay] = useState(false);
  const [showNavList, setShowhowNavList] = useState(false)
  const handleOverlayOpen = () => {
    setShowOverlay(true);
  };

  const {user} = useUser();
  const handleOverlayClose = () => {
    setShowOverlay(false);
  };

  const handleNav = () => {
    setShowhowNavList(true);
  };

  return (
    <>
      

      <nav className="bg-[#000306] flex items-center justify-between px-5 md:px-10 lg:px-16 py-3 sticky top-0 left-0 w-full z-40 overflow-hidden">
        {/* Left - Logo + Nav Links */}
        {showOverlay && (
        <div className="min-h-screen sticky top-0 left-0 z-50">
          <Overlay onClose={handleOverlayClose} />
        </div>
      )}
        <div className="flex items-center gap-4 md:gap-8">
          <img
            src={Logo}
            alt="Logo"
            className="h-[50px] w-[50px] md:h-[58px] md:w-[58px] rounded-full object-cover"
          />
          <ul className={`${showNavList ? "bg-black w-full flex-col h-full flex w-fit text-left px-10 pt-10 text-white fixed pt-20 top-0 z-10 lg:hidden":"hidden"} "hidden md:flex gap-6 lg:gap-10 text-white font-medium flex-wrap"`}>
            <div onClick={()=>{setShowhowNavList(false)}} className="md:hidden hover:text-[#8C2A8F] cursor-pointer fixed top-10 right-10 px-5">
              <FaTimes size={20}/>
            </div>
            <li onClick={()=>{setShowhowNavList(false)}}>
              <Link to="/" className="hover:text-[#8C2A8F] transition">
                Home
              </Link>
            </li>
            <li>
              {
                user!== null ? 
                (
                  <Link to={`/user/dashboard`} className="hover:text-[#8C2A8F] transition">
                Dashboard
              </Link>
                ):
                (
                  <Link to={'/sign_in'} className="hover:text-[#8C2A8F] transition">
                Dashboard
              </Link>
                )
              }
            </li>
            <li>
              <button
                onClick={handleOverlayOpen}
                className="hover:text-[#8C2A8F] transition"
              >
                SignUp
              </button>
            </li>
            <li>
              <Link to="/sign_in" className="hover:text-[#8C2A8F] transition">
                SignIn
              </Link>
            </li>
          </ul>
        </div>

        {/* Center - Wallet / Connect */}
        <div className="md:flex items-center gap-2 justify-center hidden ">
          
            <ConnectButton />
          
        </div>

        {/* Right - Mobile Menu Icon */}
        <div className="text-white md:hidden px-5"  onClick={handleNav}>
          <MdGridView size={25} />
        </div>
      </nav>
    </>
  );
};
