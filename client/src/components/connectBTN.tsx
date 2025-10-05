import { useAccount, useDisconnect } from 'wagmi'

export default function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      {!isConnected ? (
        // ✅ Use the Web Component directly
        <w3m-button />
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <button
            onClick={() => disconnect()}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md"
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  )
}
