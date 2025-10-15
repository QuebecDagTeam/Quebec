
import './App.css'
import { BrowserRouter, Routes, Route,  } from 'react-router-dom';
import { Home } from './pages/onboarding/Home';
import { UserAuth } from './pages/auth/user'; 
import { Dash } from './pages/dashboard/user';
import { ThirdPartyAuth } from './pages/auth/thirdParty';
import { ThirdPartyDash } from './pages/dashboard/thirdParty';
import Pricing from './pages/pricing';
import { Notify } from './pages/notifications';
import { ZPay } from './pages/Zpay';
function App() {

  return (
   <BrowserRouter>
         {/* <Head/> */}
         <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/reg/user" element={<UserAuth />} />
            <Route path="/reg/third_party" element={<ThirdPartyAuth />} />
           <Route path="/user/dashboard" element={<Dash />} />
          <Route path="/third_party/dashboard" element={<ThirdPartyDash />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/notifications" element={<Notify />} />
                    <Route path="/zpay" element={<ZPay />} />

         </Routes>
       </BrowserRouter>
  )
}

export default App
