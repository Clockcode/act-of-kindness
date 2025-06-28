'use client'

import styles from './styles.module.css'
import { type BaseError, useSendTransaction } from 'wagmi'
import { parseEther } from 'viem'
import { useEffect, useState } from 'react'
interface SendModalProps {
  onClose: () => void;
}

export default function SendModal({ onClose }: SendModalProps) {
  const { data: hash, isPending, error, sendTransaction } = useSendTransaction()
  const [address, setAddress] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      // TODO: Call API to get address
      setAddress("0x0000000000000000000000000000000000000000")
    }
  }, [address])

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const to = address as `0x${string}`
    const value = formData.get('value') as string
    sendTransaction({ to, value: parseEther(value) })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Send Some Kindness</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <form className={styles.content} onSubmit={submit}>
          <input name="value" placeholder="0.05" required />
          <button type="submit" className={styles.button} disabled={isPending}>{isPending ? "Sending..." : "Send"}</button>
          {hash && <div>Transaction Hash: {hash}</div>}
          {error && (
            <div>Error: {(error as BaseError).shortMessage || error.message}</div>
          )}
        </form>
      </div>
    </div>
  )
}