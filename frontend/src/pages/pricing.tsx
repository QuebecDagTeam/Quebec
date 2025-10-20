import React from 'react';
import { MdDoneAll } from 'react-icons/md';

const Pricing: React.FC = () => {
  
    const [type, setType] = React.useState<string>("month");
    const handleType = (text:string) =>{
      setType(text)
    }
  return (
    <div className="py-20  bg-[#000306]  text-white flex flex-col items-center ">
      <h2 className="text-4xl font-semibold mb-6 text-center">QUEBEC Pricing Plans</h2>
      <p className="text-lg text-gray-600 mb-12  text-center">
        Our flexible pricing plans and revenue streams are designed to grow with you.
      </p>

      <div className='px-2 py-1 bg-[#424242]  text-white w-[180px] flex  justify-between rounded-[8px]'>
        <button className={`${type==="month" && "bg-black"} px-3 py-1 rounded-[4px]`} onClick={()=>{handleType("month")}}>Monthly</button>
        <button className={`${type==="year" && "bg-black"} px-3 py-1 rounded-[4px]`} onClick={()=>{handleType("year")}}>Yearly</button>
      </div>
  {
          type==="month" &&
      <div className="flex justify-center flex-wrap gap-6 py-5 px-5 md:px-10">
        {/* Free Plan */}
        <div className={`rounded-[15px] px-5 py-5 border-2 border-[#424242] text-white `}  >
          <h3 className="text-2xl font-semibold mb-4">Free</h3>
          <p>Everything you need readily available</p>
          <span className="text-[36px] font-bold mb-6">$0</span><span>/month</span>
          <ul className="text-left text-lg mb-8 space-y-4 text-gray-300">
            <li className='flex gap-2 items-center'><MdDoneAll/> Basic KYC Verification</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Limited to 50 Verifications</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Basic Support</li>
          </ul>
          <button className={`hover:bg-[#ff00cc] text-white border-2 border-[#ff00cc]  text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Get Started
          </button>
        </div>

        {/* Basic Plan */}
      
        
        <div className={`rounded-[15px] px-5 py-5 border-2 border-[#424242] text-white `}  >
          <h3 className="text-2xl font-semibold mb-4 ">Basic</h3>
          <p>Up to 500 verification </p>
          <span className="text-[36px] font-bold mb-6">$20</span><span>/month</span>
          <ul className="text-left text-lg mb-8 space-y-4 text-gray-300">
            <li className='flex gap-2 items-center'><MdDoneAll/>Enhanced KYC Verification</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Up to 500 Verifications</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Support</li>
          </ul>
          <button className={`hover:bg-[#ff00cc] text-white border-2 border-[#ff00cc]  text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Choose Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className={`rounded-[15px] px-5 py-5 border-2 border-[#424242] text-white `} >
          <h3 className="text-2xl font-semibold mb-4">Premium</h3>
          <p>Up to 1000 Verifications</p>
          <span className="text-[36px] font-bold mb-6">$60</span><span>/month</span>
          <ul className="text-left text-lg mb-8 space-y-4 text-gray-300">
            <li className='flex gap-2 items-center'><MdDoneAll/>Premium Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Up to 1000 Verifications</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Premium Support</li>
          </ul>
          <button className={`hover:bg-[#ff00cc] text-white border-2 border-[#ff00cc]  text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Choose Plan
          </button>
        </div>
       
      </div>
       }

       {
          type==="year" &&
      <div className="flex justify-center flex-wrap gap-6 py-5 md:px-10 px-5">
        {/* Free Plan */}
        <div className={`rounded-[15px] px-5 py-5 border-2 border-[#424242] text-white `}  >
          <h3 className="text-2xl font-semibold mb-4">Free</h3>
          <p>Everything you need readily available</p>
          <span className="text-[36px] font-bold mb-6">$0</span><span>/month</span>
          <ul className="text-left text-lg mb-8 space-y-4 text-gray-300">
            <li className='flex gap-2 items-center'><MdDoneAll/> Basic KYC Verification</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Limited to 50 Verifications</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Basic Support</li>
          </ul>
          <button className={`hover:bg-[#ff00cc] text-white border-2 border-[#ff00cc]  text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Get Started
          </button>
        </div>

        {/* Basic Plan */}
      
        
        <div className={`rounded-[15px] px-5 py-5 border-2 border-[#424242] text-white `}  >
          <h3 className="text-2xl font-semibold mb-4 ">Basic</h3>
          <p>Up to 500 verification </p>
          <span className="text-[36px] font-bold mb-6">$192</span><span>/month</span>
          <small> (20% discount)</small>
          <ul className="text-left text-lg mb-8 space-y-4 text-gray-300">
            <li className='flex gap-2 items-center'><MdDoneAll/>Enhanced KYC Verification</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Up to 500 Verifications</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Support</li>
          </ul>
          <button className={`hover:bg-[#ff00cc] text-white border-2 border-[#ff00cc]  text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Choose Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className={`rounded-[15px] px-5 py-5 border-2 border-[#424242] text-white `} >
          <h3 className="text-2xl font-semibold mb-4">Premium</h3>
          <p>Up to 1000 Verifications</p>
          <span className="text-[36px] font-bold mb-6">$500</span><span>/month</span>
          <small> (30% discount)</small>
          <ul className="text-left text-lg mb-8 space-y-4 text-gray-300">
            <li className='flex gap-2 items-center'><MdDoneAll/>Premium Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Up to 1000 Verifications</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Standard Application Access</li>
            <li className='flex gap-2 items-center'><MdDoneAll/>Premium Support</li>
          </ul>
          <button className={`hover:bg-[#ff00cc] text-white border-2 border-[#ff00cc]  text-[#8C2A8F] w-full py-3 my-4 rounded-[10px]`}>
            Choose Plan
          </button>
        </div>
       
      </div>
       }
    </div>
  );
};

export default Pricing;
