import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '@/app/page'
import { useAccount } from 'wagmi'
import { useUserName } from '@/hooks/useUserName'

jest.mock('wagmi')
jest.mock('@/hooks/useUserName')

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseUserName = useUserName as jest.MockedFunction<typeof useUserName>

describe('User Flow Integration Tests', () => {
  const mockSetName = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should complete full first-time user onboarding flow', async () => {
    const user = userEvent.setup()
    
    // Step 1: User arrives, wallet not connected
    mockUseAccount.mockReturnValue({
      isConnected: false,
      address: undefined
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: mockSetName
    })

    const { rerender } = render(<Home />)
    
    // Should see wallet connect screen
    expect(screen.getByText('💼 Connect Your Wallet to Get Started')).toBeInTheDocument()
    expect(screen.queryByText('Set Your Name')).not.toBeInTheDocument()
    
    // Step 2: User connects wallet
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    rerender(<Home />)
    
    // Should see name setup screen
    expect(screen.getByText('🎉 Welcome to the Kindness Community!')).toBeInTheDocument()
    expect(screen.getByText('Set Your Name')).toBeInTheDocument()
    
    // Step 3: User clicks set name button
    const setNameButton = screen.getByText('Set Your Name')
    await user.click(setNameButton)
    
    // Should see name input modal
    expect(screen.getByText('Set Your Name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument()
    
    // Step 4: User enters name and submits
    const nameInput = screen.getByPlaceholderText('Enter your name...')
    await user.type(nameInput, 'John Doe')
    
    const confirmButton = screen.getByText('Confirm')
    await user.click(confirmButton)
    
    expect(mockSetName).toHaveBeenCalledWith('John Doe')
    
    // Step 5: Name is successfully set
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: mockSetName
    })
    
    rerender(<Home />)
    
    // Should see main app with welcome message and action buttons
    expect(screen.getByText('Welcome back, John Doe! 👋')).toBeInTheDocument()
    expect(screen.getByText('Give Kindness')).toBeInTheDocument()
    expect(screen.getByText('Receive Kindness')).toBeInTheDocument()
  })

  it('should handle returning user flow', async () => {
    const user = userEvent.setup()
    
    // Returning user with wallet connected and name set
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'Jane Smith',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: mockSetName
    })

    render(<Home />)
    
    // Should immediately see main app
    expect(screen.getByText('Welcome back, Jane Smith! 👋')).toBeInTheDocument()
    expect(screen.getByText('Give Kindness')).toBeInTheDocument()
    expect(screen.getByText('Receive Kindness')).toBeInTheDocument()
    
    // Should not see wallet connect or name setup
    expect(screen.queryByText('Connect Your Wallet')).not.toBeInTheDocument()
    expect(screen.queryByText('Set Your Name')).not.toBeInTheDocument()
  })

  it('should handle wallet disconnect during session', async () => {
    const user = userEvent.setup()
    
    // Start with connected wallet and set name
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: mockSetName
    })

    const { rerender } = render(<Home />)
    
    // Should see main app
    expect(screen.getByText('Welcome back, John Doe! 👋')).toBeInTheDocument()
    
    // Simulate wallet disconnect
    mockUseAccount.mockReturnValue({
      isConnected: false,
      address: undefined
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: mockSetName
    })
    
    rerender(<Home />)
    
    // Should show wallet connect screen
    expect(screen.getByText('💼 Connect Your Wallet to Get Started')).toBeInTheDocument()
    expect(screen.queryByText('Welcome back, John Doe!')).not.toBeInTheDocument()
  })

  it('should handle name setting transaction failure and retry', async () => {
    const user = userEvent.setup()
    
    // Connected wallet, first time user
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: mockSetName
    })

    const { rerender } = render(<Home />)
    
    // Open name input modal
    const setNameButton = screen.getByText('Set Your Name')
    await user.click(setNameButton)
    
    // Enter name and submit
    const nameInput = screen.getByPlaceholderText('Enter your name...')
    await user.type(nameInput, 'John Doe')
    
    const confirmButton = screen.getByText('Confirm')
    await user.click(confirmButton)
    
    // Simulate transaction error
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: new Error('Transaction failed'),
      setName: mockSetName
    })
    
    rerender(<Home />)
    
    // Should show error
    expect(screen.getByText('Error: Transaction failed')).toBeInTheDocument()
    
    // User can retry
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: mockSetName
    })
    
    rerender(<Home />)
    
    // Try again
    await user.click(confirmButton)
    expect(mockSetName).toHaveBeenLastCalledWith('John Doe')
  })

  it('should handle loading states throughout the flow', async () => {
    const user = userEvent.setup()
    
    // Connected wallet, name setting in progress
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: true,
      error: null,
      setName: mockSetName
    })

    render(<Home />)
    
    // Open name input modal
    const setNameButton = screen.getByText('Set Your Name')
    await user.click(setNameButton)
    
    // Should show loading state
    expect(screen.getByText('Setting name...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /setting name/i })).toBeDisabled()
  })

  it('should maintain modal state consistency', async () => {
    const user = userEvent.setup()
    
    // Connected user with name set
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      isLoading: false,
      error: null,
      setName: mockSetName
    })

    render(<Home />)
    
    // Open give kindness modal
    const giveButton = screen.getByText('Give Kindness')
    await user.click(giveButton)
    
    // Modal should be open
    expect(screen.getByText('🎁 Give Kindness')).toBeInTheDocument()
    
    // Close modal
    const closeButton = screen.getByText('×')
    await user.click(closeButton)
    
    // Modal should be closed
    expect(screen.queryByText('🎁 Give Kindness')).not.toBeInTheDocument()
    
    // Main app should still be visible
    expect(screen.getByText('Welcome back, John Doe! 👋')).toBeInTheDocument()
  })

  it('should handle edge case where user refreshes during name setup', async () => {
    // Simulate page refresh during name setup - wallet connected but name not set
    mockUseAccount.mockReturnValue({
      isConnected: true,
      address: '0x1234567890123456789012345678901234567890'
    } as any)
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      isLoading: false,
      error: null,
      setName: mockSetName
    })

    render(<Home />)
    
    // Should return to name setup screen
    expect(screen.getByText('🎉 Welcome to the Kindness Community!')).toBeInTheDocument()
    expect(screen.getByText('Set Your Name')).toBeInTheDocument()
  })
})