import { defaultWagmiConfig, createWeb3Modal } from '@web3modal/wagmi/react'
import { blockdagPrimordial } from '../chains'

// 👇 Replace with your own project ID from WalletConnect Cloud
const projectId = '6b7306869912f399b50e5c77bdc26fdf'

// ✅ Use only your custom chain
export const chains = [blockdagPrimordial] as const

// ✅ Create wagmi config
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'BlockDAG Dapp',
    description: 'Connect only to BlockDAG Primordial chain',
    url: 'https://yourdapp.com',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
      defaultChain: blockdagPrimordial,
  }
})

// ✅ Initialize Web3Modal
createWeb3Modal({
  wagmiConfig,
  projectId,
  chains
})
