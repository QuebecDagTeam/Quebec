import Hero from "../../assets/hero-g1.png";
import { ConnectButton } from "../../components/connectBTN";
export const HeroSection = () => {

  return (


    <section
      className="w-full bg-cover bg-center  flex flex-col justify-between ">
      <aside className="flex flex-col md:flex-row pt-32  md:pt-32 lg:pt-5 items-center xl:px-20">

        <div className="flex-1 w-[1/2]flex flex-col items-start justify-center  flex-1 px-3 md:px-10  ">
          <p className="text-white text-[36px] sm:text-[36px] mdlg lg:text-[48px] lg:text-[60px] font-[600] leading-tight">
            Your Universal Digital Identity
          </p>
          <p className="text-white text-[16px] sm:text-[18px] mt-4">
            The Most Secure and Simple Way to Manage Your Online Identity. 
            Verify once, Access Everytime and for Life.        </p>
          <div className="mt-1 hidden md:flex flex-col lg:flex-row gap-2 ">
            <ConnectButton />
            <button className="login text-white text-sm">Login</button>
          </div>
          <div>
            {/* <img src={Hero2}/>         */}
          </div>
        </div>
        <img src={Hero} className="flex-1 w-full md:w-1/2 bg-blur-sm" />
        <div className="mt-1 md:hidden flex flex-col w-full gap-2 px-3 mb-3">
          <ConnectButton />
          <button className="login text-white text-sm">Login</button>
        </div>

      </aside>
    </section>

  );
};
