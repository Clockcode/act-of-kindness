'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import WalletConnect from '@/components/client/WalletConnect';
import GiveKindnessModal from '@/components/client/GiveKindnessModal';
import ReceiveKindnessModal from '@/components/client/ReceiveKindnessModal';
import PoolDashboard from '@/components/client/PoolDashboard';
import UserNameInput from '@/components/client/UserNameInput';
import { useUserName } from '@/hooks/useUserName';

export default function Home() {
  const { isConnected } = useAccount();
  const { userName, hasName, isFirstTime } = useUserName();
  const [showGiveModal, setShowGiveModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);

  // Close name input modal when user successfully sets name
  useEffect(() => {
    if (showNameInput && hasName) {
      setShowNameInput(false);
    }
  }, [showNameInput, hasName]);

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

        {/* Daily Status - Moved to top */}
        {isConnected && hasName && (
          <div className="w-full max-w-2xl mb-6">
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="card-body text-center py-4">
                <h2 className="text-2xl font-semibold text-primary mb-2">
                  Welcome back, {userName}! 👋
                </h2>
                <p className="text-base-content/70">
                  Ready to spread some kindness today?
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection Flow */}
        {!isConnected ? (
          <div className="flex flex-col items-center gap-6">
            <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
              <div className="card-body text-center">
                <h2 className="card-title justify-center text-2xl mb-4">
                  💼 Connect Your Wallet to Get Started
                </h2>
                <p className="text-base-content/70 mb-6">
                  Join the daily kindness economy and start making a difference
                </p>
                <WalletConnect />
              </div>
            </div>
          </div>
        ) : isFirstTime ? (
          <div className="flex flex-col items-center gap-6">
            <div className="card bg-base-100 shadow-xl border-2 border-secondary/20">
              <div className="card-body text-center">
                <h2 className="card-title justify-center text-2xl mb-4">
                  🎉 Welcome to the Kindness Community!
                </h2>
                <p className="text-base-content/70 mb-6">
                  Let's set up your profile to get started
                </p>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => setShowNameInput(true)}
                >
                  Set Your Name
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Action Buttons - Only show when wallet connected and name set */
          <div className="flex flex-col sm:flex-row gap-6">
            <button
              className="btn btn-primary btn-lg text-lg px-12 py-6 h-auto hover:scale-105 transition-transform"
              onClick={() => setShowGiveModal(true)}
            >
              <span className="text-3xl mr-3">🎁</span>
              Give Kindness
            </button>

            <button
              className="btn btn-secondary btn-lg text-lg px-12 py-6 h-auto hover:scale-105 transition-transform"
              onClick={() => setShowReceiveModal(true)}
            >
              <span className="text-3xl mr-3">🤲</span>
              Receive Kindness
            </button>
          </div>
        )}
      </div>

      {/* Pool Dashboard - Only show when connected */}
      {isConnected && hasName && <PoolDashboard />}

      {/* Modals */}
      {showGiveModal && (
        <GiveKindnessModal onClose={() => setShowGiveModal(false)} />
      )}
      
      {showReceiveModal && (
        <ReceiveKindnessModal onClose={() => setShowReceiveModal(false)} />
      )}
      
      {showNameInput && (
        <UserNameInput onClose={() => setShowNameInput(false)} />
      )}
    </div>
  );
}
