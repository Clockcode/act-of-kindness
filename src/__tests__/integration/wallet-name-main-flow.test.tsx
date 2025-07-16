import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import Home from '@/app/page'
import { useAccount } from 'wagmi'
import { useUserName } from '@/hooks/useUserName'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useConnect: jest.fn(),
  useDisconnect: jest.fn(),
}))
jest.mock('@/hooks/useUserName', () => ({
  useUserName: jest.fn(),
}))

// Mock all dynamic components to focus on the flow logic
jest.mock('@/components/client/WalletConnect', () => {
  return function MockWalletConnect() {
    return (
      <div data-testid="wallet-connect">
        <button data-testid="connect-wallet-button">Connect Wallet</button>
      </div>
    )
  }
})

jest.mock('@/components/client/UserNameInput', () => {
  return function MockUserNameInput({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="username-input">
        <h2>Welcome to Kindness Pool!</h2>
        <form data-testid="name-form" onSubmit={(e) => {
          e.preventDefault()
          // Simulate successful name setting after delay
          setTimeout(() => onClose(), 500)
        }}>
          <input data-testid="name-input" placeholder="Enter your name..." />
          <button type="submit" data-testid="submit-name-button">Set My Name</button>
        </form>
      </div>
    )
  }
})

jest.mock('@/components/client/GiveKindnessModal', () => {
  return function MockGiveKindnessModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="give-modal">
        Give Kindness Modal
        <button onClick={onClose} data-testid="close-give-modal">Close</button>
      </div>
    )
  }
})

jest.mock('@/components/client/ReceiveKindnessModal', () => {
  return function MockReceiveKindnessModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="receive-modal">
        Receive Kindness Modal
        <button onClick={onClose} data-testid="close-receive-modal">Close</button>
      </div>
    )
  }
})

jest.mock('@/components/client/PoolDashboard', () => {
  return function MockPoolDashboard() {
    return <div data-testid="pool-dashboard">Pool Dashboard</div>
  }
})

const mockUseAccount = useAccount as jest.Mock
const mockUseUserName = useUserName as jest.Mock

describe('Wallet → Name Setup → Main App Flow', () => {
  const mockSetUserName = jest.fn()
  const mockSetLocalName = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockSetUserName.mockResolvedValue(undefined)
  })

  describe('Initial Wallet Connection Flow', () => {
    it('should show wallet connection screen for disconnected users', () => {
      // Setup: User not connected
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined
      } as any)

      mockUseUserName.mockReturnValue({
        userName: '',
        hasName: false,
        localName: '',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: false, // Not first time because wallet not connected
        isTransactionSuccess: false,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      } as any)

      render(<Home />)

      // Verify wallet connection screen is shown
      expect(screen.getByText('💼 Connect Your Wallet to Get Started')).toBeInTheDocument()
      expect(screen.getByTestId('wallet-connect')).toBeInTheDocument()
      
      // Verify main app elements are not shown
      expect(screen.queryByTestId('main-actions')).not.toBeInTheDocument()
      expect(screen.queryByTestId('onboarding-flow')).not.toBeInTheDocument()
    })
  })

  describe('Onboarding Flow After Wallet Connection', () => {
    it('should show onboarding screen for connected users without names', () => {
      // Setup: User connected but no name set
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      mockUseUserName.mockReturnValue({
        userName: '',
        hasName: false,
        localName: '',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: true, // First time because connected but no name
        isTransactionSuccess: false,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      } as any)

      render(<Home />)

      // Verify onboarding screen is shown
      expect(screen.getByText('🎉 Welcome to the Kindness Community!')).toBeInTheDocument()
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument()
      expect(screen.getByTestId('set-name-button')).toBeInTheDocument()
      
      // Verify other screens are not shown
      expect(screen.queryByTestId('wallet-connection-flow')).not.toBeInTheDocument()
      expect(screen.queryByTestId('main-actions')).not.toBeInTheDocument()
    })

    it('should open name input modal when "Set Your Name" is clicked', async () => {
      const user = userEvent.setup()
      
      // Setup: Connected user, no name
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      mockUseUserName.mockReturnValue({
        userName: '',
        hasName: false,
        localName: '',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: true,
        isTransactionSuccess: false,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      } as any)

      render(<Home />)

      // Click "Set Your Name"
      const setNameButton = screen.getByTestId('set-name-button')
      await user.click(setNameButton)

      // Verify name input modal appears
      expect(screen.getByTestId('username-input')).toBeInTheDocument()
      expect(screen.getByText('Welcome to Kindness Pool!')).toBeInTheDocument()
    })
  })

  describe('Main App Flow After Name Setup', () => {
    it('should show main app interface for users with names set', () => {
      // Setup: Connected user with name
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      mockUseUserName.mockReturnValue({
        userName: 'John Doe',
        hasName: true,
        localName: 'John Doe',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: false, // Not first time because name is set
        isTransactionSuccess: true,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      } as any)

      render(<Home />)

      // Verify main app elements are shown
      expect(screen.getByTestId('welcome-message')).toBeInTheDocument()
      expect(screen.getByText('Welcome back, John Doe! 👋')).toBeInTheDocument()
      expect(screen.getByTestId('main-actions')).toBeInTheDocument()
      expect(screen.getByTestId('give-kindness-button')).toBeInTheDocument()
      expect(screen.getByTestId('receive-kindness-button')).toBeInTheDocument()
      
      // Verify onboarding elements are not shown
      expect(screen.queryByTestId('wallet-connection-flow')).not.toBeInTheDocument()
      expect(screen.queryByTestId('onboarding-flow')).not.toBeInTheDocument()
    })

    it('should open modals when action buttons are clicked', async () => {
      const user = userEvent.setup()
      
      // Setup: Main app state
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      mockUseUserName.mockReturnValue({
        userName: 'Jane Smith',
        hasName: true,
        localName: 'Jane Smith',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: false,
        isTransactionSuccess: true,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      } as any)

      render(<Home />)

      // Test Give Kindness modal
      const giveButton = screen.getByTestId('give-kindness-button')
      await user.click(giveButton)
      expect(screen.getByTestId('give-modal')).toBeInTheDocument()
      
      // Close Give modal
      await user.click(screen.getByTestId('close-give-modal'))
      expect(screen.queryByTestId('give-modal')).not.toBeInTheDocument()

      // Test Receive Kindness modal
      const receiveButton = screen.getByTestId('receive-kindness-button')
      await user.click(receiveButton)
      expect(screen.getByTestId('receive-modal')).toBeInTheDocument()
      
      // Close Receive modal
      await user.click(screen.getByTestId('close-receive-modal'))
      expect(screen.queryByTestId('receive-modal')).not.toBeInTheDocument()
    })
  })

  describe('Complete Flow Simulation', () => {
    it('should transition through all states correctly', async () => {
      const user = userEvent.setup()
      let currentUserState = {
        userName: '',
        hasName: false,
        localName: '',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: false,
        isTransactionSuccess: false,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      }

      // Step 1: Start disconnected
      mockUseAccount.mockReturnValue({
        isConnected: false,
        address: undefined
      } as any)

      mockUseUserName.mockReturnValue(currentUserState as any)

      const { rerender } = render(<Home />)

      // Verify wallet connection screen
      expect(screen.getByTestId('wallet-connection-flow')).toBeInTheDocument()

      // Step 2: Simulate wallet connection
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      currentUserState.isFirstTime = true // Now first time because connected but no name

      mockUseUserName.mockReturnValue(currentUserState as any)
      rerender(<Home />)

      // Verify onboarding screen
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument()
      expect(screen.queryByTestId('wallet-connection-flow')).not.toBeInTheDocument()

      // Step 3: Click set name
      const setNameButton = screen.getByTestId('set-name-button')
      await user.click(setNameButton)

      // Verify name input modal
      expect(screen.getByTestId('username-input')).toBeInTheDocument()

      // Step 4: Fill and submit name (simulate completion)
      const nameInput = screen.getByTestId('name-input')
      await user.type(nameInput, 'Alice Cooper')
      
      const submitButton = screen.getByTestId('submit-name-button')
      
      // Simulate name setting in progress
      currentUserState.isSettingName = true
      mockUseUserName.mockReturnValue(currentUserState as any)
      rerender(<Home />)
      
      await user.click(submitButton)

      // Wait for mock submission
      await waitFor(() => {
        expect(screen.queryByTestId('username-input')).not.toBeInTheDocument()
      }, { timeout: 1000 })

      // Step 5: Simulate name successfully set
      currentUserState = {
        ...currentUserState,
        userName: 'Alice Cooper',
        hasName: true,
        localName: 'Alice Cooper',
        isSettingName: false,
        isFirstTime: false,
        isTransactionSuccess: true,
      }

      mockUseUserName.mockReturnValue(currentUserState as any)
      rerender(<Home />)

      // Verify main app screen
      expect(screen.getByTestId('welcome-message')).toBeInTheDocument()
      expect(screen.getByText('Welcome back, Alice Cooper! 👋')).toBeInTheDocument()
      expect(screen.getByTestId('main-actions')).toBeInTheDocument()
      expect(screen.queryByTestId('onboarding-flow')).not.toBeInTheDocument()
      expect(screen.queryByTestId('wallet-connection-flow')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle name setting errors gracefully', () => {
      // Setup: Connected user with name setting error
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      mockUseUserName.mockReturnValue({
        userName: '',
        hasName: false,
        localName: '',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: false,
        isFirstTime: true,
        isTransactionSuccess: false,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: new Error('Transaction failed'),
      } as any)

      render(<Home />)

      // Should still show onboarding (user can retry)
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument()
      expect(screen.getByTestId('set-name-button')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('should show appropriate loading states during name setting', () => {
      // Setup: User in the middle of setting name
      mockUseAccount.mockReturnValue({
        isConnected: true,
        address: '0x1234567890123456789012345678901234567890'
      } as any)

      mockUseUserName.mockReturnValue({
        userName: '',
        hasName: false,
        localName: 'Alice',
        setLocalName: mockSetLocalName,
        setUserName: mockSetUserName,
        isSettingName: true, // Currently setting name
        isFirstTime: true,
        isTransactionSuccess: false,
        isTransactionPending: false,
        isTransactionLoading: false,
        error: null,
      } as any)

      render(<Home />)

      // Should still show onboarding screen but with loading indicators
      expect(screen.getByTestId('onboarding-flow')).toBeInTheDocument()
      // The loading state would be visible in the actual modal, 
      // but since we're mocking the modal, we just verify the flow continues
    })
  })
})