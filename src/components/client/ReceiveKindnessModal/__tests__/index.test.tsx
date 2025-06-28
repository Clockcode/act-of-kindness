import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReceiveKindnessModal from '../index'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

jest.mock('wagmi')

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseReadContract = useReadContract as jest.MockedFunction<typeof useReadContract>
const mockUseWriteContract = useWriteContract as jest.MockedFunction<typeof useWriteContract>
const mockUseWaitForTransactionReceipt = useWaitForTransactionReceipt as jest.MockedFunction<typeof useWaitForTransactionReceipt>

describe('ReceiveKindnessModal', () => {
  const mockOnClose = jest.fn()
  const mockWriteContract = jest.fn()
  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAccount.mockReturnValue({
      address: '0x1234567890123456789012345678901234567890',
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    // Mock pool status - not in pool
    mockUseReadContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInReceiverPool') {
        return {
          data: false,
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      if (functionName === 'getPoolStatus') {
        return {
          data: [
            BigInt('500000000000000000'), // currentAmount: 0.5 ETH
            BigInt('1000000000000000000'), // dailyTarget: 1 ETH
            5, // receiverCount
            10, // maxReceivers
            Math.floor(Date.now() / 1000) + 3600 // nextDistribution: 1 hour from now
          ],
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      return {
        data: undefined,
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: false,
        refetch: mockRefetch,
        status: 'idle'
      } as any
    })

    mockUseWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
      error: null,
      isError: false,
      isIdle: true,
      isLoading: false,
      isPending: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'idle',
      variables: undefined
    } as any)

    mockUseWaitForTransactionReceipt.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: false,
      status: 'idle'
    } as any)
  })

  it('should render the modal with pool stats', () => {
    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('🤲 Receive Kindness')).toBeInTheDocument()
    expect(screen.getByText("Today's Pool:")).toBeInTheDocument()
    expect(screen.getByText('2.500 ETH')).toBeInTheDocument()
    expect(screen.getByText('Receivers:')).toBeInTheDocument()
    expect(screen.getByText('15/100')).toBeInTheDocument()
  })

  it('should show enter pool button when not in pool', () => {
    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Enter Pool')).toBeInTheDocument()
    expect(screen.getByText('Join the receiver pool to be eligible for today\'s kindness distribution')).toBeInTheDocument()
  })

  it('should show leave pool button when in pool', () => {
    // Mock being in the pool
    mockUseReadContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInReceiverPool') {
        return {
          data: true,
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      if (functionName === 'getPoolStatus') {
        return {
          data: [
            BigInt('500000000000000000'),
            BigInt('1000000000000000000'),
            5,
            10,
            Math.floor(Date.now() / 1000) + 3600
          ],
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      return {
        data: undefined,
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: false,
        refetch: mockRefetch,
        status: 'idle'
      } as any
    })

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Leave Pool')).toBeInTheDocument()
    expect(screen.getByText('You are currently in the receiver pool')).toBeInTheDocument()
  })

  it('should call enterReceiverPool when enter button is clicked', async () => {
    const user = userEvent.setup()
    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    const enterButton = screen.getByText('Enter Pool')
    await user.click(enterButton)
    
    expect(mockWriteContract).toHaveBeenCalledWith({
      address: process.env.NEXT_PUBLIC_KINDNESS_POOL_ADDRESS,
      abi: expect.any(Array),
      functionName: 'enterReceiverPool'
    })
  })

  it('should call leaveReceiverPool when leave button is clicked', async () => {
    const user = userEvent.setup()
    
    // Mock being in the pool
    mockUseReadContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInReceiverPool') {
        return {
          data: true,
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      return {
        data: [
          BigInt('500000000000000000'),
          BigInt('1000000000000000000'),
          5,
          10,
          Math.floor(Date.now() / 1000) + 3600
        ],
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: mockRefetch,
        status: 'success'
      } as any
    })

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    const leaveButton = screen.getByText('Leave Pool')
    await user.click(leaveButton)
    
    expect(mockWriteContract).toHaveBeenCalledWith({
      address: process.env.NEXT_PUBLIC_KINDNESS_POOL_ADDRESS,
      abi: expect.any(Array),
      functionName: 'leaveReceiverPool'
    })
  })

  it('should show loading state during transaction', () => {
    mockUseWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: '0xhash123',
      error: null,
      isError: false,
      isIdle: false,
      isLoading: false,
      isPending: true,
      isSuccess: false,
      reset: jest.fn(),
      status: 'pending',
      variables: undefined
    } as any)

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /processing/i })).toBeDisabled()
  })

  it('should show success state after transaction completes', () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      data: { status: 'success' },
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: true,
      status: 'success'
    } as any)

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('🎉 Success!')).toBeInTheDocument()
    expect(screen.getByText('Transaction completed successfully!')).toBeInTheDocument()
  })

  it('should show error state on transaction failure', () => {
    mockUseWriteContract.mockReturnValue({
      writeContract: mockWriteContract,
      data: undefined,
      error: new Error('Transaction failed'),
      isError: true,
      isIdle: false,
      isLoading: false,
      isPending: false,
      isSuccess: false,
      reset: jest.fn(),
      status: 'error',
      variables: undefined
    } as any)

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Error: Transaction failed')).toBeInTheDocument()
  })

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    const closeButton = screen.getByText('×')
    await user.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('should handle wallet not connected', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Please connect your wallet first')).toBeInTheDocument()
  })

  it('should show loading state when pool data is loading', () => {
    mockUseReadContract.mockImplementation(() => ({
      data: undefined,
      error: null,
      isError: false,
      isLoading: true,
      isSuccess: false,
      refetch: mockRefetch,
      status: 'loading'
    }) as any)

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Loading pool data...')).toBeInTheDocument()
  })

  it('should show pool full message when at capacity', () => {
    // Mock pool at capacity
    mockUseReadContract.mockImplementation(({ functionName }) => {
      if (functionName === 'isInReceiverPool') {
        return {
          data: false,
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      if (functionName === 'getPoolStatus') {
        return {
          data: [
            BigInt('500000000000000000'),
            BigInt('1000000000000000000'),
            10, // receiverCount = maxReceivers
            10, // maxReceivers
            Math.floor(Date.now() / 1000) + 3600
          ],
          error: null,
          isError: false,
          isLoading: false,
          isSuccess: true,
          refetch: mockRefetch,
          status: 'success'
        } as any
      }
      return {
        data: undefined,
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: false,
        refetch: mockRefetch,
        status: 'idle'
      } as any
    })

    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Pool is full')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pool is full/i })).toBeDisabled()
  })

  it('should auto-refresh pool data every 5 seconds', () => {
    jest.useFakeTimers()
    
    render(<ReceiveKindnessModal onClose={mockOnClose} />)
    
    // Fast-forward 5 seconds
    jest.advanceTimersByTime(5000)
    
    expect(mockRefetch).toHaveBeenCalled()
    
    jest.useRealTimers()
  })
})