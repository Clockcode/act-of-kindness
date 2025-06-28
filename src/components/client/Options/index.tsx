'use client'
import styles from './styles.module.css'
import SendModal from '../SendModal/'
import WalletConnect from '../WalletConnect/'
import { useState, useCallback } from 'react'

export default function Options() {
  const [showSendModal, setShowSendModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)

  const handleCloseSendModal = useCallback(() => {
    setShowSendModal(false)
  }, [])

  return (
    <>
    <WalletConnect />
      <div className={styles.options}>
        <button className={styles.option} onClick={() => setShowSendModal(true)}>Be kind</button>
        <button className={styles.option} onClick={() => setShowReceiveModal(true)}>Receive kindness</button>
      </div>
      {showSendModal && <SendModal onClose={handleCloseSendModal} />}
      {showReceiveModal && <div>Receive modal placeholder</div>}
    </>
  )
}
