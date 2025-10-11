import { DisconnectBTN } from "../../../frontendDag/src/components/connectBTN"

export const Nav = () => {
    return(
        <nav className=" w-72 p-5 h-[500px] sticky hidden md:block">
            <div className="p-5 bg-gray-800 text-white rounded-[12px] mb-5">
               <p className="font-[800] text-[28px] text-white">KYC-4ALL</p>
            </div>
            <ul className="flex flex-col gap-5 bg-gray-800 text-white p-5 rounded-[18px] h-full">
                <li className="p-2 hover:bg-blue-800 hover:rounded-[5px]">Home</li>
                <li className="p-2 hover:bg-blue-800 hover:rounded-[5px]">History</li>
                <li className="p-2 hover:bg-blue-800 hover:rounded-[5px]">Wallet</li>
                <li className="p-2 hover:bg-blue-800 hover:rounded-[5px]">EXplorer</li>
                <div className="relative -bottom-30">
                <DisconnectBTN/>
            </div>
            </ul>
        </nav>
    )
}