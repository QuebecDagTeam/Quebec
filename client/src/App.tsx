import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ConnectButton from "./components/connectBTN.tsx"
import KYCForm from "./components/form.tsx"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <ConnectButton/>
    <KYCForm/>
          </>
  )
}

export default App
