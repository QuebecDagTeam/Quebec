import { RequestAccess } from "../components/requestAccess"
import { useAccount } from "wagmi";

export const ZPay = () => {
      const { address } = useAccount();

  return (
    <section className="bg-[#333]  w-full h-screen flex flezx-col justify-center items-center text-white gap-10">
        <p>ZPay - Powered by Quebec KYC</p>
        <RequestAccess thirdPartyAddress={address}/>
    </section>
  )
}