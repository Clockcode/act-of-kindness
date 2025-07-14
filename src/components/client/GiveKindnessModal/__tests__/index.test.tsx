import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GiveKindnessModal from '../index'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useContractConstants } from '@/hooks/useContractConstants'

jest.mock('wagmi')
jest.mock('@/hooks/useContractConstants')

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseWriteContract = useWriteContract as jest.MockedFunction<typeof useWriteContract>
const mockUseWaitForTransactionReceipt = useWaitForTransactionReceipt as jest.MockedFunction<typeof useWaitForTransactionReceipt>
const mockUseContractConstants = useContractConstants as jest.MockedFunction<typeof useContractConstants>

describe('GiveKindnessModal', () => {
  const mockOnClose = jest.fn()
  const mockWriteContract = jest.fn()

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

    mockUseContractConstants.mockReturnValue({
      constants: {
        dailyPoolAmount: BigInt('1000000000000000000'), // 1 ETH
        maxReceivers: 10,
        contributionLimit: BigInt('100000000000000000'), // 0.1 ETH
        nameCharacterLimit: 32
      },
      isLoading: false,
      error: null,
      refetch: jest.fn()
    })
  })

  it('should render the modal with give kindness form', () => {
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('🎁 Give Kindness')).toBeInTheDocument()
    expect(screen.getByText('Amount (ETH)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('0.01')).toBeInTheDocument()
    expect(screen.getByText('Give Kindness')).toBeInTheDocument()
  })

  it('should handle amount input correctly', async () => {
    const user = userEvent.setup()
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('0.01')
    await user.type(input, '0.05')
    
    expect(input).toHaveValue('0.05')
  })

  it('should show contribution limit warning', () => {
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText(/Maximum contribution: 0\.1 ETH/)).toBeInTheDocument()
  })

  it('should prevent submission with invalid amount', async () => {
    const user = userEvent.setup()
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('0.01')
    const submitButton = screen.getByText('Give Kindness')
    
    // Test with empty amount
    await user.click(submitButton)
    expect(mockWriteContract).not.toHaveBeenCalled()
    
    // Test with zero amount
    await user.type(input, '0')
    await user.click(submitButton)
    expect(mockWriteContract).not.toHaveBeenCalled()
  })

  it('should prevent submission with amount exceeding limit', async () => {
    const user = userEvent.setup()
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('0.01')
    const submitButton = screen.getByText('Give Kindness')
    
    await user.type(input, '0.2') // Above 0.1 ETH limit
    await user.click(submitButton)
    
    expect(mockWriteContract).not.toHaveBeenCalled()
  })

  it('should submit valid contribution', async () => {
    const user = userEvent.setup()
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('0.01')
    const submitButton = screen.getByText('Give Kindness')
    
    await user.type(input, '0.05')
    await user.click(submitButton)
    
    expect(mockWriteContract).toHaveBeenCalledWith({
      address: process.env.NEXT_PUBLIC_KINDNESS_POOL_ADDRESS,
      abi: expect.any(Array),
      functionName: 'giveKindness',
      value: BigInt('50000000000000000') // 0.05 ETH in wei
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

    render(<GiveKindnessModal onClose={mockOnClose} />)
    
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

    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('🎉 Kindness Given!')).toBeInTheDocument()
    expect(screen.getByText('Thank you for your contribution!')).toBeInTheDocument()
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

    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Error: Transaction failed')).toBeInTheDocument()
  })

  it('should close modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
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

    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Please connect your wallet first')).toBeInTheDocument()
  })

  it('should show loading state when contract constants are loading', () => {
    mockUseContractConstants.mockReturnValue({
      constants: {
        dailyPoolAmount: BigInt('1000000000000000000'),
        maxReceivers: 10,
        contributionLimit: BigInt('100000000000000000'),
        nameCharacterLimit: 32
      },
      isLoading: true,
      error: null,
      refetch: jest.fn()
    })

    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should handle form submission with Enter key', async () => {
    const user = userEvent.setup()
    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('0.01')
    await user.type(input, '0.05')
    await user.keyboard('{Enter}')
    
    expect(mockWriteContract).toHaveBeenCalled()
  })

  it('should reset form after successful transaction', async () => {
    mockUseWaitForTransactionReceipt.mockReturnValue({
      data: { status: 'success' },
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: true,
      status: 'success'
    } as any)

    render(<GiveKindnessModal onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('0.01')
    expect(input).toHaveValue('')
  })
})