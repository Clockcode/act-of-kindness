import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'
import { useAccount } from 'wagmi'
import { useUserName } from '@/hooks/useUserName'
import { testHydrationConsistency } from '@/__tests__/utils/hydration-testing'

jest.mock('wagmi')
jest.mock('@/hooks/useUserName')
jest.mock('@/components/client/WalletConnect', () => {
  return function MockWalletConnect() {
    return <div data-testid="wallet-connect">Wallet Connect Component</div>
  }
})
jest.mock('@/components/client/GiveKindnessModal', () => {
  return function MockGiveKindnessModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="give-modal">
        Give Kindness Modal
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
})
jest.mock('@/components/client/ReceiveKindnessModal', () => {
  return function MockReceiveKindnessModal({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="receive-modal">
        Receive Kindness Modal
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
})
jest.mock('@/components/client/PoolDashboard', () => {
  return function MockPoolDashboard() {
    return <div data-testid="pool-dashboard">Pool Dashboard</div>
  }
})
jest.mock('@/components/client/UserNameInput', () => {
  return function MockUserNameInput({ onClose }: { onClose: () => void }) {
    return (
      <div data-testid="username-input">
        User Name Input
        <button onClick={onClose}>Close</button>
      </div>
    )
  }
})

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseUserName = useUserName as jest.MockedFunction<typeof useUserName>

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render hero section', () => {
    mockUseAccount.mockReturnValue({
      isConnected: false
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    expect(screen.getByText('💖 Random Act of Kindness')).toBeInTheDocument()
    expect(screen.getByText('A daily kindness economy powered by blockchain')).toBeInTheDocument()
  })

  it('should show wallet connect when not connected', () => {
    mockUseAccount.mockReturnValue({
      isConnected: false
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    expect(screen.getByText('💼 Connect Your Wallet to Get Started')).toBeInTheDocument()
    expect(screen.getByTestId('wallet-connect')).toBeInTheDocument()
  })

  it('should show name setup for first-time connected users', () => {
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    expect(screen.getByText('🎉 Welcome to the Kindness Community!')).toBeInTheDocument()
    expect(screen.getByText('Set Your Name')).toBeInTheDocument()
  })

  it('should show welcome message and action buttons for returning users', () => {
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    expect(screen.getByText('Welcome back, John Doe! 👋')).toBeInTheDocument()
    expect(screen.getByText('Give Kindness')).toBeInTheDocument()
    expect(screen.getByText('Receive Kindness')).toBeInTheDocument()
    expect(screen.getByTestId('pool-dashboard')).toBeInTheDocument()
  })

  it('should open name input modal when setup button is clicked', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    const setupButton = screen.getByText('Set Your Name')
    await user.click(setupButton)
    
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
  })

  it('should open give kindness modal when give button is clicked', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    const giveButton = screen.getByText('Give Kindness')
    await user.click(giveButton)
    
    expect(screen.getByTestId('give-modal')).toBeInTheDocument()
  })

  it('should open receive kindness modal when receive button is clicked', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    const receiveButton = screen.getByText('Receive Kindness')
    await user.click(receiveButton)
    
    expect(screen.getByTestId('receive-modal')).toBeInTheDocument()
  })

  it('should close modals when onClose is called', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    // Open and close give modal
    const giveButton = screen.getByText('Give Kindness')
    await user.click(giveButton)
    
    const giveModal = screen.getByTestId('give-modal')
    expect(giveModal).toBeInTheDocument()
    
    const closeGiveButton = screen.getByText('Close')
    await user.click(closeGiveButton)
    
    expect(screen.queryByTestId('give-modal')).not.toBeInTheDocument()
  })

  it('should auto-close name input modal when name is set', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    // Start with no name
    const mockUseUserNameInitial = {
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    }
    
    mockUseUserName.mockReturnValue(mockUseUserNameInitial)

    const { rerender } = render(<Home />)
    
    // Open name input modal
    const setupButton = screen.getByText('Set Your Name')
    await user.click(setupButton)
    
    expect(screen.getByTestId('username-input')).toBeInTheDocument()
    
    // Simulate name being set
    mockUseUserName.mockReturnValue({
      ...mockUseUserNameInitial,
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false
    })
    
    rerender(<Home />)
    
    // Modal should auto-close
    await waitFor(() => {
      expect(screen.queryByTestId('username-input')).not.toBeInTheDocument()
    })
  })

  it('should not show pool dashboard when wallet not connected', () => {
    mockUseAccount.mockReturnValue({
      isConnected: false
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    expect(screen.queryByTestId('pool-dashboard')).not.toBeInTheDocument()
  })

  it('should not show pool dashboard when name not set', () => {
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    expect(screen.queryByTestId('pool-dashboard')).not.toBeInTheDocument()
  })

  // Test hydration consistency
  it('should hydrate correctly without mismatches', testHydrationConsistency(
    React.createElement(() => {
      mockUseAccount.mockReturnValue({ isConnected: false } as any)
      mockUseUserName.mockReturnValue({
        userName: '',
        hasName: false,
        isFirstTime: true,
        isLoading: false,
        error: null,
        setName: jest.fn()
      })
      return <Home />
    })
  ))

  it('should handle multiple modals correctly', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      isConnected: true
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: jest.fn()
    })

    render(<Home />)
    
    // Should be able to open different modals sequentially
    const giveButton = screen.getByText('Give Kindness')
    await user.click(giveButton)
    expect(screen.getByTestId('give-modal')).toBeInTheDocument()
    
    // Close first modal
    await user.click(screen.getByText('Close'))
    expect(screen.queryByTestId('give-modal')).not.toBeInTheDocument()
    
    // Open second modal
    const receiveButton = screen.getByText('Receive Kindness')
    await user.click(receiveButton)
    expect(screen.getByTestId('receive-modal')).toBeInTheDocument()
  })
})