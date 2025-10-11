import Logo from "../../assets/logo.jpg";


export const Dash = () => {
    return(
        <section className="bg-[#2F2F2F] flex items-center justify-between gap-[30px]">
            <div className="flex justify-center items-center">
                <img src={Logo} className="w-[58px] h-[58px] rounded-full"/>
                <p className="text-[20px] font-[600]">QUEBEC</p>
            </div>
        </section>
    )
}