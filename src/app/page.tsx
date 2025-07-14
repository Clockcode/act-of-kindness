'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';
import { HydrationBoundary } from '@/components/client/HydrationBoundary';
import { useUserName } from '@/hooks/useUserName';

// Dynamic imports for client-only components to improve performance
const WalletConnect = dynamic(() => import('@/components/client/WalletConnect'), {
  ssr: false,
  loading: () => (
    <div className="btn btn-primary btn-lg px-8 py-4 h-auto font-semibold text-lg shadow-lg loading">
      <span className="loading loading-spinner loading-sm mr-2"></span>
      Loading...
    </div>
  )
});

const GiveKindnessModal = dynamic(() => import('@/components/client/GiveKindnessModal'), {
  ssr: false
});

const ReceiveKindnessModal = dynamic(() => import('@/components/client/ReceiveKindnessModal'), {
  ssr: false
});

const PoolDashboard = dynamic(() => import('@/components/client/PoolDashboard'), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="card bg-base-100 shadow-lg animate-pulse">
        <div className="card-body">
          <div className="h-8 bg-base-300 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-base-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
});

const UserNameInput = dynamic(() => import('@/components/client/UserNameInput'), {
  ssr: false
});

const WalletProviderResolver = dynamic(() => import('@/components/client/WalletProviderResolver'), {
  ssr: false
});

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
      {/* Wallet Provider Conflict Detection */}
      <HydrationBoundary>
        <WalletProviderResolver />
      </HydrationBoundary>
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">💖 Random Act of Kindness</h1>
          <p className="text-xl text-base-content/70">
            A daily kindness economy powered by blockchain
          </p>
        </div>

        {/* Daily Status - Moved to top */}
        <HydrationBoundary
          fallback={null}
          suppressHydrationWarning={true}
        >
          {isConnected && hasName && userName && (
          <div className="w-full max-w-2xl mb-6" data-testid="welcome-message">
            <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <div className="card-body text-center py-4">
                <h2 className="text-2xl font-semibold text-primary mb-2" data-testid="welcome-text">
                  Welcome back, {userName}! 👋
                </h2>
                <p className="text-base-content/70">
                  Ready to spread some kindness today?
                </p>
              </div>
            </div>
          </div>
          )}
        </HydrationBoundary>

        {/* Wallet Connection Flow */}
        <HydrationBoundary
          fallback={
            <div className="flex flex-col items-center gap-6">
              <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
                <div className="card-body text-center">
                  <h2 className="card-title justify-center text-2xl mb-4">
                    💼 Connect Your Wallet to Get Started
                  </h2>
                  <p className="text-base-content/70 mb-6">
                    Join the daily kindness economy and start making a difference
                  </p>
                  <div className="btn btn-primary btn-lg loading">Loading...</div>
                </div>
              </div>
            </div>
          }
        >
          {!isConnected ? (
          <div className="flex flex-col items-center gap-6" data-testid="wallet-connection-flow">
            <div className="card bg-base-100 shadow-xl border-2 border-primary/20">
              <div className="card-body text-center">
                <h2 className="card-title justify-center text-2xl mb-4" data-testid="connect-wallet-title">
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
          <div className="flex flex-col items-center gap-6" data-testid="onboarding-flow">
            <div className="card bg-base-100 shadow-xl border-2 border-secondary/20">
              <div className="card-body text-center">
                <h2 className="card-title justify-center text-2xl mb-4" data-testid="onboarding-title">
                  🎉 Welcome to the Kindness Community!
                </h2>
                <p className="text-base-content/70 mb-6">
                  Let&apos;s set up your profile to get started
                </p>
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={() => setShowNameInput(true)}
                  data-testid="set-name-button"
                >
                  Set Your Name
                </button>
              </div>
            </div>
          </div>
          ) : (
          /* Action Buttons - Only show when wallet connected and name set */
          <div className="flex flex-col sm:flex-row gap-6" data-testid="main-actions">
            <button
              className="btn btn-primary btn-lg text-lg px-12 py-6 h-auto hover:scale-105 transition-transform"
              onClick={() => setShowGiveModal(true)}
              data-testid="give-kindness-button"
            >
              <span className="text-3xl mr-3">🎁</span>
              Give Kindness
            </button>

            <button
              className="btn btn-secondary btn-lg text-lg px-12 py-6 h-auto hover:scale-105 transition-transform"
              onClick={() => setShowReceiveModal(true)}
              data-testid="receive-kindness-button"
            >
              <span className="text-3xl mr-3">🤲</span>
              Receive Kindness
            </button>
          </div>
          )}
        </HydrationBoundary>
      </div>

      {/* Pool Dashboard - Only show when connected */}
      <HydrationBoundary>
        {isConnected && hasName && <PoolDashboard />}
      </HydrationBoundary>

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
