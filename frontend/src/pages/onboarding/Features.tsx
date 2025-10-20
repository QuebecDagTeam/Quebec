import { FaUserFriends } from "react-icons/fa";
import { MdSecurity, MdWorkOutline } from "react-icons/md";
export const Feartures = () =>{
      const cardDetails = [
        {
          icon: <MdWorkOutline size={28} />,
          title: "Decentralized Identity Storage",
          text: "Your KYC data is securely encrypted and stored on the blockchain. No central server, no single point of failure",
        color:"#ff00cc"
        },
         {
          icon: <MdWorkOutline size={28} />,
          title: "Ehanced Verification",
          text:"Real time face capture and validation ensure that every identity is genuie, unique and tamper-proof.",
                color:"#3333ff"

        },
        {
          icon: <FaUserFriends size={28} />,
          title: "Third-Party access control",
          text: "User have full control over who can access their KYC details and can revoke access anytime",
                color:"#ff00cc"
        },
          {
          icon: <FaUserFriends size={28} />,
          title: "One KYC multiple usage",
          text: "With just one KYC on QUebec, you can avoid repititive kyc over and over again",
                color:"#3333ff"
        },
        {
          icon: <MdSecurity size={28} />,
          title: "Multi-Wallet integration",
          text: "Seamlessly connect your crypto wallet for authentication and verification.",
        color:"#ff00cc"
        },
          {
          icon: <MdSecurity size={28} />,
          title: "Immutable Records",
          text: "Each verified data is recorded and encrypted onchain, creating transparent and audible identity trails for organizations.",
        color:"#3333ff"
        },
      ];
    
    return(
        <section className="bg-[#000306] xl:px-20">
        {/* <p className="md:text-[32px] text-[24px] font-bold text-white pt-10 text-center">Features </p> */}
        <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-10 text-white">
          {cardDetails.map((card, i) => (
            <div
              key={i}
              className={`bg-[#070F12] w-full sm:w-[250px] lg:w-[280px] lg:h-[200px] lg:w-[300px] p-6 rounded-lg flex flex-col gap-3 border-b-4 border-b-[${card.color}] hover:-translate-y-1 transition-transform`}
            >
              <div className={`bg-[${card.color}] text-white w-[48px] h-[48px] rounded-[15px] flex items-center justify-center`}>
                {card.icon}
              </div>
              <div>
                <p className="font-semibold">{card.title}</p>
                <p className="text-[13px] text-gray-300">{card.text}</p>
              </div>
            </div>
          ))}
        </div>

        </section>
    )
}