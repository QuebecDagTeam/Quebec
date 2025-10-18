
import './App.css'
import { BrowserRouter, Routes, Route,  } from 'react-router-dom';
import { Home } from './pages/onboarding/Home';
import { SignUpUser } from './pages/auth/signUpUser'; 
import { Dash } from './pages/dashboard/user';
import { SignUpThirdParty } from './pages/auth/SignUpThirdParty';
import { ThirdPartyDash } from './pages/dashboard/thirdParty';
import Pricing from './pages/pricing';
import { Notify } from './pages/notifications';
import { ZPay } from './pages/Zpay';
import {SignIn}  from './pages/auth/signIn';
import {UserProvider}  from './contexts/UserContext';

function App() {

  return (
    <UserProvider>
   <BrowserRouter>
         {/* <Head/> */}
         <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/sign_up/user" element={<SignUpUser />} />
           <Route path="/sign_in" element={<SignIn />} />
            <Route path="/sign_up/third_party" element={<SignUpThirdParty />} />
           <Route path="/user/dashboard" element={<Dash />} />
          <Route path="/third_party/dashboard" element={<ThirdPartyDash />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/notifications" element={<Notify />} />
                    <Route path="/zpay" element={<ZPay />} />

         </Routes>
       </BrowserRouter>
       </UserProvider>
  )
}

export default App
