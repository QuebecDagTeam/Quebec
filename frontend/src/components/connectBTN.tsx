import React from "react";
import { useAccount, useDisconnect } from "wagmi";

const ConnectButton: React.FC = () => {
  const { address, isConnected } = useAccount();

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {!isConnected ? (
        // ✅ Web3Modal button web component
        <w3m-button />
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
