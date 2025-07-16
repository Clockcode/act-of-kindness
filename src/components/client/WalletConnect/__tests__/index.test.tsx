import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import WalletConnect from '../index'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

jest.mock('wagmi')

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseConnect = useConnect as jest.MockedFunction<typeof useConnect>
const mockUseDisconnect = useDisconnect as jest.MockedFunction<typeof useDisconnect>

describe('WalletConnect', () => {
  const mockConnect = jest.fn()
  const mockDisconnect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseConnect.mockReturnValue({
      connect: mockConnect,
      connectors: [
        { 
          id: 'injected', 
          name: 'MetaMask',
          type: 'injected'
        }
      ] as any,
      error: null,
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'idle',
      variables: undefined
    })

    mockUseDisconnect.mockReturnValue({
      disconnect: mockDisconnect,
      error: null,
      isError: false,
      isIdle: true,
      isLoading: false,
      isPending: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'idle',
      variables: undefined
    })
  })

  it('should render connect button when not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    render(<WalletConnect />)
    
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.getByText('🔗')).toBeInTheDocument()
  })

  it('should call connect when button is clicked', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    render(<WalletConnect />)
    
    const connectButton = screen.getByTestId('connect-wallet-button')
    await user.click(connectButton)
    
    expect(mockConnect).toHaveBeenCalledWith(
      expect.objectContaining({
        connector: expect.any(Object)
      })
    )
  })

  it('should show connected state when wallet is connected', () => {
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    render(<WalletConnect />)
    
    expect(screen.getByTestId('wallet-connected')).toBeInTheDocument()
    expect(screen.getByTestId('connected-address')).toBeInTheDocument()
    expect(screen.getByText('🟢 Connected: 0x1234...7890')).toBeInTheDocument()
    expect(screen.getByTestId('disconnect-button')).toBeInTheDocument()
  })

  it('should call disconnect when disconnect button is clicked', async () => {
    const user = userEvent.setup()
    
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    render(<WalletConnect />)
    
    const disconnectButton = screen.getByTestId('disconnect-button')
    await user.click(disconnectButton)
    
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should show loading state when connecting', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    // Set isPending to true to simulate loading state
    mockUseConnect.mockReturnValue({
      connect: mockConnect,
      connectors: [] as any,
      error: null,
      isLoading: false,
      isPending: true, // This triggers the loading state
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'pending',
      variables: undefined
    })

    render(<WalletConnect />)
    
    const button = screen.getByTestId('connect-wallet-button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(button.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('should format address correctly', () => {
    mockUseAccount.mockReturnValue({
      address: '0xAbCdEf1234567890123456789012345678901234',
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    render(<WalletConnect />)
    
    // The component formats address as first 6 chars + ... + last 4 chars
    expect(screen.getByText('🟢 Connected: 0xAbCd...1234')).toBeInTheDocument()
  })

  it('should handle different address formats', () => {
    const testCases = [
      {
        address: '0x742d35Cc60aA0bC2d5C4e6F2b60d8F2b2e8d8aF6',
        expected: '0x742d...8aF6'
      },
      {
        address: '0x1111111111111111111111111111111111111111',
        expected: '0x1111...1111'
      },
      {
        address: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        expected: '0xaaaa...aaaa'
      }
    ]

    testCases.forEach(({ address, expected }) => {
      mockUseAccount.mockReturnValue({
        address,
        isConnected: true,
        isConnecting: false,
        isReconnecting: false,
        isDisconnected: false,
        status: 'connected'
      } as any)

      const { rerender } = render(<WalletConnect />)
      
      expect(screen.getByText(`🟢 Connected: ${expected}`)).toBeInTheDocument()
      
      // Clean up for next iteration
      rerender(<div />)
    })
  })

  it('should not render when address is missing but isConnected is true', () => {
    mockUseAccount.mockReturnValue({
      address: undefined, // No address but connected (edge case)
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    render(<WalletConnect />)
    
    // Should show connect button since address is missing
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(screen.queryByTestId('wallet-connected')).not.toBeInTheDocument()
  })

  it('should handle button states correctly', () => {
    // Test enabled state
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    mockUseConnect.mockReturnValue({
      connect: mockConnect,
      connectors: [],
      error: null,
      isLoading: false,
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'idle',
      variables: undefined
    })

    const { rerender } = render(<WalletConnect />)
    
    let button = screen.getByTestId('connect-wallet-button')
    expect(button).toBeEnabled()
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()

    // Test disabled state
    mockUseConnect.mockReturnValue({
      connect: mockConnect,
      connectors: [],
      error: null,
      isLoading: false,
      isPending: true,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'pending',
      variables: undefined
    })

    rerender(<WalletConnect />)
    
    button = screen.getByTestId('connect-wallet-button')
    expect(button).toBeDisabled()
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
  })
})