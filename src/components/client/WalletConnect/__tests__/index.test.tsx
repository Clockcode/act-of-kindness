import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('should show connect button when wallet is not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    render(<WalletConnect />)
    
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    expect(screen.getByText('💼')).toBeInTheDocument()
  })

  it('should show connected state with formatted address', () => {
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    render(<WalletConnect />)
    
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
    expect(screen.getByText('Disconnect')).toBeInTheDocument()
  })

  it('should show connecting state', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: true,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connecting'
    } as any)

    render(<WalletConnect />)
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
  })

  it('should show reconnecting state', () => {
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: false,
      isConnecting: false,
      isReconnecting: true,
      isDisconnected: false,
      status: 'reconnecting'
    } as any)

    render(<WalletConnect />)
    
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument()
  })

  it('should call connect when connect button is clicked', async () => {
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
    
    const connectButton = screen.getByText('Connect Wallet')
    await user.click(connectButton)
    
    expect(mockConnect).toHaveBeenCalledWith({
      connector: expect.objectContaining({
        id: 'injected',
        name: 'MetaMask'
      })
    })
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
    
    const disconnectButton = screen.getByText('Disconnect')
    await user.click(disconnectButton)
    
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should show error state when connection fails', () => {
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
      error: new Error('Connection failed'),
      isLoading: false,
      isPending: false,
      isError: true,
      isSuccess: false,
      reset: jest.fn(),
      status: 'error',
      variables: undefined
    })

    render(<WalletConnect />)
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
  })

  it('should disable button when connecting', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: true,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connecting'
    } as any)

    render(<WalletConnect />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should handle multiple connectors', () => {
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
      connectors: [
        { id: 'injected', name: 'MetaMask', type: 'injected' },
        { id: 'walletConnect', name: 'WalletConnect', type: 'walletConnect' }
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

    render(<WalletConnect />)
    
    // Should use the first available connector
    expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
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
    
    expect(screen.getByText('0xAbCd...1234')).toBeInTheDocument()
  })
})