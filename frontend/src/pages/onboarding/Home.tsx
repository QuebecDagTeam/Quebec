import Pricing from "../pricing"
import { About } from "./AboutUs"
import { Feartures } from "./Features"
import { HeroSection } from "./Hero"
import {NavBar} from "./NavBar"

export const Home = () => {
    return(
        <section className="me ">
            <div className="md:px-5 fixed md:top-5 left-0 w-full">
            <NavBar/>
            </div>
        <HeroSection/>
        <Feartures/>
                <About/>
                <Pricing/>

        </section>
    )
}