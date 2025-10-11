import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

// Helper function to get a clean connector name for the button
const getConnectorName = (id: string, name: string): string => {
    if (id === 'walletConnect') return 'WalletConnect (Mobile)';
    if (id === 'injected') return 'MetaMask/Browser Wallet';
    return name;
};

const ConnectButton: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  
  // Filter connectors to only show those that are ready/available
  const availableConnectors = connectors.filter(c => c.ready);

  return (
    <div className="flex flex-col items-center gap-4 mt-4 p-6 border rounded-lg shadow-lg bg-white">
      {!isConnected ? (
        <>
          <h2 className="text-xl font-semibold text-gray-800">Connect Wallet</h2>
          {availableConnectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              // Dynamic styling based on connector (optional)
              className={`px-6 py-2 w-full max-w-xs text-white rounded-md shadow-md transition duration-200 
                        ${connector.id === 'walletConnect' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={isPending}
            >
              {isPending ? "Connecting..." : `Connect with ${getConnectorName(connector.id, connector.name)}`}
            </button>
          ))}
          {availableConnectors.length === 0 && (
            <p className="text-sm text-red-500">No available connectors found. Check Wagmi config.</p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center">
          <p className="text-lg font-medium text-green-600 mb-2">
            ✅ Wallet Connected
          </p>
          <p className="text-sm text-gray-600 font-mono p-2 bg-gray-100 rounded">
            Address: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConnectButton;

// --- Disconnect Button Component ---
export const DisconnectBTN: React.FC = () => {
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();

  if (!isConnected) return null; // Only show if connected

  return (
    <button
      onClick={() => disconnect()}
      className="px-4 py-1 bg-red-500 text-white hover:bg-red-600 rounded-md shadow-md transition duration-200"
    >
      Disconnect Wallet
    </button>
  );
};