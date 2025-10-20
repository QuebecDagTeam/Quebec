// Overlay.tsx
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.jpg";
import { FaArrowRight, FaTimes, FaUser, FaUserEdit } from "react-icons/fa";

interface OverlayProps {
  onClose: () => void;
}

export const Overlay: React.FC<OverlayProps> = ({ onClose }) => {
  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60 backdrop-blur h-screen">
      <div className="flex flex-col md:flex-row items-stretch justify-center w-[90%] max-w-[900px] md:h-[90%] rounded-[36px] overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="cursor-pointer w-10 h-10 rounded-full flex items-center text-white fixed top-2 md:top-10 right-4 md:right-10 justify-center bg-[#3333ff]"
        >
          <FaTimes />
        </button>

        {/* LEFT SIDE */}
        <aside className="bg-[#2F2F2F] flex flex-col items-center justify-center text-white p-6 md:p-10 md:w-1/2">
          <div className="flex items-center gap-4 md:mb-6 mb-2">
            <img
              src={Logo}
              alt="Logo"
              className="lg:w-[52px] w-[22px] h-[22px] lg:h-[52px] rounded-full object-cover"
            />
            <p className="md:text-[22px] font-[600]">QUEBEC</p>
          </div>
          <div className="text-center space-y-3">
            <p className="text-[18px] sm:text-[32px] font-[600]">
              Wallet Connected!
            </p>
            <p className="text-[15px] text-gray-300 leading-relaxed">
              Choose your role to proceed with a secure and seamless identity
              verification process.
            </p>
          </div>
        </aside>

        {/* RIGHT SIDE */}
        <aside className="bg-[#000000] text-white flex flex-col justify-center gap-6 p-6 md:p-10 md:w-1/2">
          {/* Continue as User */}
          <Link
            to="/sign_up/user"
            className="flex items-start gap-4 border border-[#2F2F2F] rounded-lg p-4 hover:bg-[#111111] transition"
          >
            <div className="text-[#3333ff] mt-1">
              <FaUser size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[16px]">Continue as User</p>
                <FaArrowRight className="text-[#3333ff]" />
              </div>
              <p className="text-[12px] text-gray-300 mt-1">
                Manage your digital identity, control your data, and share your
                KYC information securely.
              </p>
            </div>
          </Link>

          {/* Continue as Third Party */}
          <Link
            to="/sign_up/third_party"
            className="flex items-start gap-4 border border-[#2F2F2F] rounded-lg p-4 hover:bg-[#111111] transition"
          >
            <div className="text-[#3333ff] mt-1">
              <FaUserEdit size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-[16px]">
                  Continue as Third Party
                </p>
                <FaArrowRight className="text-[#3333ff]" />
              </div>
              <p className="text-[12px] text-gray-300 mt-1">
                Integrate with Quebec to verify user identities with their
                consent, streamlining your onboarding flow.
              </p>
            </div>
          </Link>
        </aside>
      </div>
    </section>
  );
};
