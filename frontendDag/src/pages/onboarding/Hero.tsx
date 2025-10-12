import { FaUserFriends } from "react-icons/fa";
import { MdSecurity, MdWorkOutline } from "react-icons/md";
import Hero from "../../assets/hero.jpg";
import ConnectButton from "../../../../frontendDag/src/components/connectBTN";
import { Overlay } from "./overlay";
import { useAccount } from 'wagmi'
export const HeroSection = () => {
  const { isConnected } = useAccount()
    const cardDetails = [
          {
            icon: <MdWorkOutline size={28} />,
            title: "Seamless Access",
            text: "Login with a single click",
          },
          {
            icon: <FaUserFriends size={28} />,
            title: "Enhanced Security",
            text: "Your data is safe and secure",
          },
          {
            icon: <MdSecurity size={28} />,
            title: "Web3 Ready",
            text: "Compatible with a wide range of applications",
          },
        ];
  return (
    <>
     {isConnected && (
        
          <Overlay />
      )}      
    
    <section
      className="w-full bg-cover bg-center min-h-screen flex flex-col justify-between overflow-hidden"
      style={{ backgroundImage: `url(${Hero})` }}
    >
      {/* Hero text */}
      <div>
</div>
      <div className="flex flex-col items-center justify-center text-white text-center flex-1 px-4 py-32">
        <p className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[60px] font-[600] leading-tight">
          Your Universal Digital Identity
        </p>
        <p className="text-[16px] sm:text-[18px] mt-4">
Verify once, Access everything The secure and simple way to manage your online Identity        </p>
        <div className="mt-6">
          <ConnectButton />
        </div>
      </div>
{/* <img src={Hero2} className="w-full w-[600px] h-[200px] " alt="Hero" /> */}
      {/* Cards */}
      <div className="bg-[#000306] flex flex-wrap items-center justify-center gap-6 px-4 py-10 text-white">
        {cardDetails.map((card, i) => (
          <div
            key={i}
            className="bg-[#070F12] w-full sm:w-[250px] md:w-[280px] md:h-[200px] lg:w-[300px] p-6 rounded-lg flex flex-col gap-3 border-b-2 border-b-[#71627A66] hover:-translate-y-1 transition-transform"
          >
            <div className="bg-[#E3EBF5] text-[#8C2A8F] w-[48px] h-[48px] rounded-[15px] flex items-center justify-center">
              {card.icon}
            </div>
            <div>
              <p className="font-semibold">{card.title}</p>
              <p className="text-[13px] text-gray-300">{card.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <ul className="flex flex-wrap items-center justify-center gap-6 bg-black text-white text-sm py-4">
        <li className="hover:text-[#8C2A8F] cursor-pointer transition">Privacy Policy</li>
        <li className="hover:text-[#8C2A8F] cursor-pointer transition">Terms & Conditions</li>
      </ul>
    </section>
    </>
  );
};
