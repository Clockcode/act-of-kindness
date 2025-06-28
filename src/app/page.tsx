'use client';

import { useState } from 'react';
import WalletConnect from '@/components/client/WalletConnect';
import GiveKindnessModal from '@/components/client/GiveKindnessModal';
import ReceiveKindnessModal from '@/components/client/ReceiveKindnessModal';
import PoolDashboard from '@/components/client/PoolDashboard';

export default function Home() {
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">💖 Random Act of Kindness</h1>
          <p className="text-xl text-base-content/70">
            A daily kindness economy powered by blockchain
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            className="btn btn-primary btn-lg text-lg px-12 py-6 h-auto"
            onClick={() => setShowGiveModal(true)}
          >
            <span className="text-3xl mr-3">🎁</span>
            Give Kindness
          </button>

          <button
            className="btn btn-secondary btn-lg text-lg px-12 py-6 h-auto"
            onClick={() => setShowReceiveModal(true)}
          >
            <span className="text-3xl mr-3">🤲</span>
            Receive Kindness
          </button>
        </div>

        <div className="mt-8">
          <WalletConnect />
        </div>
      </div>

      {/* Pool Dashboard */}
      <PoolDashboard />

      {/* Modals */}
      {showGiveModal && (
        <GiveKindnessModal onClose={() => setShowGiveModal(false)} />
      )}
      
      {showReceiveModal && (
        <ReceiveKindnessModal onClose={() => setShowReceiveModal(false)} />
      )}
    </div>
  );
}
