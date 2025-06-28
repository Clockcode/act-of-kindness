'use client'

import { useAccount, useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export default function WalletConnect() {
  const { isConnected, address } = useAccount()
  const { connect } = useConnect()

  if (isConnected) {
    return (
      <>
        <div>You&apos;re connected!</div>
        <div>Address: {address}</div>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={() => connect({ connector: injected() })}
    >
      Connect
    </button>
  )
}