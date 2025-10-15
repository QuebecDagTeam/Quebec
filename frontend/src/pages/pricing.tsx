import React from 'react';

const Pricing: React.FC = () => {
    const [index, setIndex] = React.useState<number | null>(1);
    const handleClick = (i: number) => {
        setIndex(i);
    }
  return (
    <div className="py-20  bg-[#000306]  text-white text-center">
      <h2 className="text-4xl font-semibold mb-6">QUEBEC Pricing Plans</h2>
      <p className="text-lg text-gray-600 mb-12">
        Our flexible pricing plans and revenue streams are designed to grow with you.
      </p>

      <div className="flex justify-center flex-wrap gap-6 py-5">
        {/* Free Plan */}
        <div className={`rounded-[10px] border-2 boder-[#8C2A8F]  px-10 ${index===1 ? "text-white":" "}`} onClick={()=>handleClick(1)}>
          <h3 className="text-2xl font-semibold mb-4">Free</h3>
          <p className="text-xl font-bold mb-6">$0/month</p>
          <ul className="text-left text-lg mb-8 space-y-4">
            <li>Basic KYC Verification</li>
            <li>Limited to 50 Verifications</li>
            <li>Standard Application Access</li>
            <li>Basic Support</li>
          </ul>
          <button className={`bg-[#8C2A8F4D] text-[#8C2A8F] my-4  w-full py-3 rounded-[10px]`}>
            Get Started
          </button>
        </div>

        {/* Basic Plan */}
        <div className={`rounded-[10px] border-2  px-10 ${index===2 ? " bg-[#8C2A8F] boder-[#8C2A8F] text-white":"border-gray-300 "}`} onClick={()=>handleClick(2)}>
          <h3 className="text-2xl font-semibold mb-4">Basic</h3>
          <p className="text-xl font-bold mb-6">$98.9/month</p>
          <ul className="text-left text-lg mb-8 space-y-4">
            <li>Enhanced KYC Verification</li>
            <li>Up to 500 Verifications</li>
            <li>Standard Application Access</li>
            <li>Standard Support</li>
          </ul>
          <button className={`bg-[#8C2A8F4D] text-[#8C2A8F] w-full my-4  py-3 rounded-[10px]`}>
            Choose Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className={`rounded-[10px] border-2  px-10 ${index===3 ? "  bg-[#8C2A8F] boder-[#8C2A8F] text-white":"border-gray-300 "}`} onClick={()=>handleClick(1)}>
          <h3 className="text-2xl font-semibold mb-4">Premium</h3>
          <p className="text-xl font-bold mb-6">$199.9/month</p>
          <ul className="text-left text-lg mb-8 space-y-4">
            <li>Premium Application Access</li>
            <li>Up to 1000 Verifications</li>
            <li>Premium Support</li>
          </ul>
          <button className={`bg-[#8C2A8F4D] text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Choose Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
