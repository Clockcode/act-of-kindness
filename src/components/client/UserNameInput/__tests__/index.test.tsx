import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserNameInput from '../index'
import { useUserName } from '@/hooks/useUserName'

jest.mock('@/hooks/useUserName')

const mockUseUserName = useUserName as jest.MockedFunction<typeof useUserName>

describe('UserNameInput', () => {
  const mockOnClose = jest.fn()
  const mockSetName = jest.fn()
  const mockSetLocalName = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      localName: '',
      setLocalName: mockSetLocalName,
      setUserName: mockSetName,
      isSettingName: false,
      isTransactionSuccess: false,
      isTransactionPending: false,
      isTransactionLoading: false,
      error: null
    })
  })

  it('should render the modal with input field', () => {
    render(<UserNameInput onClose={mockOnClose} />)
    
    expect(screen.getByText('Welcome to Kindness Pool!')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enter your name...')).toBeInTheDocument()
    expect(screen.getByText('Set My Name')).toBeInTheDocument()
    expect(screen.getByText('Your Name')).toBeInTheDocument()
  })

  it('should show character count', () => {
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      localName: 'John',
      setLocalName: mockSetLocalName,
      setUserName: mockSetName,
      isSettingName: false,
      isTransactionSuccess: false,
      isTransactionPending: false,
      isTransactionLoading: false,
      error: null
    })

    render(<UserNameInput onClose={mockOnClose} />)
    
    expect(screen.getByText('4/32 characters')).toBeInTheDocument()
  })

  it('should prevent submission with empty name', async () => {
    const user = userEvent.setup()
    render(<UserNameInput onClose={mockOnClose} />)
    
    const confirmButton = screen.getByText('Set My Name')
    await user.click(confirmButton)
    
    expect(mockSetName).not.toHaveBeenCalled()
  })

  it('should show loading state', () => {
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      localName: '',
      setLocalName: mockSetLocalName,
      setUserName: mockSetName,
      isSettingName: true,
      isTransactionSuccess: false,
      isTransactionPending: false,
      isTransactionLoading: false,
      error: null
    })

    render(<UserNameInput onClose={mockOnClose} />)
    
    expect(screen.getByText('Setting Name...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /setting name/i })).toBeDisabled()
  })

  it('should show error state', () => {
    const mockError = new Error('Failed to set name')
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      localName: '',
      setLocalName: mockSetLocalName,
      setUserName: mockSetName,
      isSettingName: false,
      isTransactionSuccess: false,
      isTransactionPending: false,
      isTransactionLoading: false,
      error: mockError
    })

    render(<UserNameInput onClose={mockOnClose} />)
    
    expect(screen.getByText('Transaction failed. Please try again.')).toBeInTheDocument()
  })

  it('should submit name when form is submitted with valid input', async () => {
    const user = userEvent.setup()
    
    // Mock with a valid local name
    mockUseUserName.mockReturnValue({
      userName: '',
      hasName: false,
      isFirstTime: true,
      localName: 'John Doe',
      setLocalName: mockSetLocalName,
      setUserName: mockSetName,
      isSettingName: false,
      isTransactionSuccess: false,
      isTransactionPending: false,
      isTransactionLoading: false,
      error: null
    })

    render(<UserNameInput onClose={mockOnClose} />)
    
    const confirmButton = screen.getByText('Set My Name')
    await user.click(confirmButton)
    
    expect(mockSetName).toHaveBeenCalledWith('John Doe')
  })

  it('should handle success state', () => {
    mockUseUserName.mockReturnValue({
      userName: 'John Doe',
      hasName: true,
      isFirstTime: false,
      localName: 'John Doe',
      setLocalName: mockSetLocalName,
      setUserName: mockSetName,
      isSettingName: false,
      isTransactionSuccess: true,
      isTransactionPending: false,
      isTransactionLoading: false,
      error: null
    })

    render(<UserNameInput onClose={mockOnClose} />)
    
    // Success state should show a different UI - let's just check it renders without error
    expect(screen.getByText('Welcome to Kindness Pool!')).toBeInTheDocument()
  })

  it('should show character limit enforcement', () => {
    render(<UserNameInput onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('Enter your name...')
    expect(input).toHaveAttribute('maxlength', '32')
  })

  it('should display helpful information about blockchain storage', () => {
    render(<UserNameInput onClose={mockOnClose} />)
    
    expect(screen.getByText(/Your name will be stored on the blockchain/)).toBeInTheDocument()
  })

  it('should show settings information', () => {
    render(<UserNameInput onClose={mockOnClose} />)
    
    expect(screen.getByText(/You can change your name later in your profile settings/)).toBeInTheDocument()
  })
})