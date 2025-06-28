'use client';

import { useState, useEffect } from 'react';
import { useUserName } from '@/hooks/useUserName';

interface UserNameInputProps {
  onClose: () => void;
}

export default function UserNameInput({ onClose }: UserNameInputProps) {
  const { 
    localName, 
    setLocalName, 
    setUserName, 
    isSettingName, 
    hasName,
    isTransactionSuccess,
    isTransactionPending,
    isTransactionLoading,
    error: transactionError
  } = useUserName();
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!localName.trim()) {
      setError('Please enter a name');
      return;
    }

    if (localName.trim().length > 32) {
      setError('Name must be 32 characters or less');
      return;
    }

    setError('');
    setIsSubmitted(true);
    await setUserName(localName.trim());
  };

  // Close modal automatically when name is set
  useEffect(() => {
    if (isSubmitted && hasName && !isSettingName) {
      // Small delay to show success state briefly
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [isSubmitted, hasName, isSettingName, onClose]);

  // Show success state if name was set successfully
  if (isSubmitted && hasName && !isSettingName) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-green-600">
              Welcome to the Community!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your name has been set successfully. Get ready to spread some kindness!
            </p>
            <div className="flex justify-center">
              <div className="loading loading-dots loading-lg text-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            Welcome to Kindness Pool!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            What would you like to be called in our community?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 dark:placeholder-gray-400"
              value={localName}
              onChange={(e) => {
                setLocalName(e.target.value);
                setError('');
              }}
              maxLength={32}
              disabled={isSettingName}
              autoFocus
            />
            {(error || transactionError) && (
              <p className="text-sm text-red-500 mt-1">
                {error || (transactionError ? 'Transaction failed. Please try again.' : '')}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {localName.length}/32 characters
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Your name will be stored on the blockchain and visible to other users in the community.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
              disabled={!localName.trim() || isSettingName}
            >
              {isTransactionPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirm in Wallet...
                </>
              ) : isTransactionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Transaction...
                </>
              ) : isSettingName ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting Name...
                </>
              ) : (
                'Set My Name'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            You can change your name later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}