import Hero from "../../assets/herog-2.png";

export const About = () =>{
    return(
        <section className="bg-black pt-10 px-5 md:px-10 xl:px-20 flex flex-col-reverse md:flex-row text-white items-center justify-center">
            <div className="flex-1">
                <img src={Hero}/>
            </div>
            <div className="flex-1 xl:px-20">
                <p className="text-[32px] font-bold">About Quebec</p>
                <div className="flex gap-3 flex-col ">
                    <p>
                    Quebec is a decentralized digital KYC platform built on blockDag to redefine how identity verification works in the web3 era.
                    at quebec, user's data matter first and so we help individual and bussiness to securely verify, manage and share digital idenities without breaching or exposing any sensitive user.
                </p>
                <p>
                    With blockchain-backed transparency and privacy-first encryption, Quebec bridges trust between users, service providers and any other digital ecosystems safely, instantly and globally.
                </p>
                <p>A user focused web3 digital KYC solution, Built for the user and contol by the user</p>
                </div>
            </div>
        </section>
    )
}