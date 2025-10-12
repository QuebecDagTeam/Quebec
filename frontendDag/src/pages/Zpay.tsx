import { RequestAccess } from "../components/requestAccess"
import { useAccount } from "wagmi";

export const ZPay = () => {
      const { address } = useAccount();

  return (
    <section>
        <p>ZPay - Powered by Quebec KYC</p>
        <RequestAccess thirdPartyAddress={address}/>
    </section>
  )
}