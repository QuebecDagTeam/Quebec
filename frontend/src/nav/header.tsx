import ConnectButton from "../components/connectBTN"

export const Header = () => {
    return (
        
            <div className="flex-1 flex justify-between items-center text-white px-4 py-5 w-full bg-gray-800  mt-5">
                <p className='font-bold text-[28px]'>BLOCKDAG HACKATHON</p>
                <ConnectButton/>
            </div>
    )
}