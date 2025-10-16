import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

// --- 1. Connect Button Component ---

/**
 * Renders a 'Connect Wallet' button when the user is disconnected.
 * Clicking it opens the Web3Modal connection interface.
 */
export const ConnectButton = () => {
  // Check connection status
  const {  address, isConnected } = useAccount();
  
  // Get the modal control
  const { open } = useWeb3Modal();

  // Render nothing if already connected
  if (isConnected) {
       null
   }

  // Render the connect button
  return (
    <>
    {isConnected && 
     <p className="text-white text-sm">
    Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
  </p>  }
    <button
      // On click, open the modal to the default 'Connect' view
      
      onClick={() => open()}
      className="bg-[#8C2A8F] hover:bg-[#8C2A8F] text-white font-bold py-[12px] px-4 rounded-full"
    >
      Connect Wallet
    </button>
    </>
  );
};

// --- 2. Disconnect Button Component ---

/**
 * Renders the connected address and a 'Disconnect' button when connected.
 * Clicking it opens the Web3Modal Account view where the user can disconnect.
 */
export const DisconnectBTN = () => {
  // Get wallet state
  const {isConnected } = useAccount();
  
  // Get the modal control
  const { open } = useWeb3Modal();

  // Render nothing if not connected
  if (!isConnected) {
    return null;
  }

  // Render the connected status and disconnect action
  return (
      <button 
        // On click, open the modal to the 'Account' view for disconnection
        onClick={() => open({ view: 'Account' })}
      >
        Disconnect
      </button>
  );
};