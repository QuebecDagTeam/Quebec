import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi/react'
import { blockdagAwakening } from '../chains'

// 👇 Replace with your own project ID from WalletConnect Cloud
const projectId =import.meta.env.VITE_PROJECT_ID

// ✅ Use only your custom chain
export const chains = [blockdagAwakening] as const

// ✅ Create wagmi config
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'BlockDAG Dapp',
    description: 'Connect only to BlockDAG Primordial chain',
    url: 'http://localhost:5173/',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
      // defaultChain: blockdagAwakening,
  }
});

// ✅ Initialize Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
});
