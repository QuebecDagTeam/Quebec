import { HeroSection } from "./Hero"
import {NavBar} from "./NavBar"

export const Home = () => {
    return(
        <section className="me overflow-y-hidden">
            <div className="md:px-5 fixed md:top-5 left-0 w-full">
            <NavBar/>
            </div>
        <HeroSection/>
        </section>
    )
}