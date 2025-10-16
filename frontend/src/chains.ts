export const blockdagPrimordial = {
  id: 1043,
  name: 'BlockDAG Primordial',
  nativeCurrency: {
    decimals: 18,
    name: 'BlockDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.primordial.bdagscan.com'],
    },
    public: {
      http: ['https://rpc.primordial.bdagscan.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BDAGScan',
      url: 'https://primordial.bdagscan.com',
    },
  },
} as const


export const blockdagAwakening = {
  id: 1043,
  name: 'BlockDAG Awakening',
  nativeCurrency: {
    decimals: 18,
    name: 'BlockDAG',
    symbol: 'BDAG',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.awakening.bdagscan.com'],
    },
    public: {
      http: ['https://rpc.awakening.bdagscan.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BDAGScan (Awakening)',
      url: 'https://awakening.bdagscan.com',
    },
  },
  testnet: true,
} as const;
