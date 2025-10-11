
import './App.css'
import { BrowserRouter, Routes, Route,  } from 'react-router-dom';
import { Home } from './pages/onboarding/Home';
import { UserAuth } from './pages/auth/user'; 
function App() {

  return (
   <BrowserRouter>
         {/* <Head/> */}
         <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/reg/user" element={<UserAuth />} />
         </Routes>
       </BrowserRouter>
  )
}

export default App
