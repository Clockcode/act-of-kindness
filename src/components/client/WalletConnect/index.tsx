'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function WalletConnect() {
  const { isConnected, address } = useAccount()
  const { connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col items-center gap-3" data-testid="wallet-connected">
        <div className="badge badge-success badge-lg px-4 py-3">
          <span className="text-sm font-medium" data-testid="connected-address">
            🟢 Connected: {formatAddress(address)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => disconnect()}
          className="btn btn-ghost btn-sm text-gray-500 hover:text-error"
          data-testid="disconnect-button"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="btn btn-primary btn-lg px-8 py-4 h-auto font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      data-testid="connect-wallet-button"
    >
      {isPending ? (
        <>
          <span className="loading loading-spinner loading-sm mr-2"></span>
          Connecting...
        </>
      ) : (
        <>
          <span className="text-2xl mr-3">🔗</span>
          Connect Wallet
        </>
      )}
    </button>
  )
}