import React from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const ConnectButton: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const injectedConnector = connectors.find((c) => c.id === 'injected');

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {!isConnected ? (
        <button
          onClick={() => {
            if (injectedConnector) connect({ connector: injectedConnector });
          }}
          className="px-3 py-1 bg-blue-600 text-white button hover:bg-blue-700 rounded-md"
          disabled={isPending || !injectedConnector}
        >
          {isPending ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <>
          <p className="text-sm text-gray-600 button">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </>
      )}
    </div>
  );
};

export default ConnectButton;

export const DisconnectBTN: React.FC = () => {
  const { disconnect } = useDisconnect();

  return (
    <button
      onClick={() => disconnect()}
      className="px-3 py-1 bg-gray-200 button hover:bg-gray-300 rounded-md"
    >
      Disconnect
    </button>
  );
};
