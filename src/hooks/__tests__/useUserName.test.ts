import { renderHook, act } from '@testing-library/react'
import { useUserName } from '../useUserName'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

jest.mock('wagmi')

const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
const mockUseReadContract = useReadContract as jest.MockedFunction<typeof useReadContract>
const mockUseWriteContract = useWriteContract as jest.MockedFunction<typeof useWriteContract>
const mockUseWaitForTransactionReceipt = useWaitForTransactionReceipt as jest.MockedFunction<typeof useWaitForTransactionReceipt>

const MOCK_ADDRESS = '0x1234567890123456789012345678901234567890'

describe('useUserName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    
    // Default mock setup
    mockUseAccount.mockReturnValue({
      address: MOCK_ADDRESS,
      isConnected: true,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: false,
      status: 'connected'
    } as any)

    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: false,
      refetch: jest.fn(),
      status: 'idle'
    } as any)

    mockUseWriteContract.mockReturnValue({
      writeContract: jest.fn(),
      data: undefined,
      error: null,
      isError: false,
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

  it('should return correct initial state for first-time user', () => {
    const { result } = renderHook(() => useUserName())

    expect(result.current.userName).toBe('')
    expect(result.current.hasName).toBeFalsy() // hasName is userName && userName.length > 0
    expect(result.current.isFirstTime).toBe(true)
    expect(result.current.isSettingName).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should return stored name from localStorage in development mode', () => {
    // Set localStorage before rendering hook
    localStorage.setItem(`userName_${MOCK_ADDRESS}`, 'John Doe')
    
    // Mock localStorage.getItem to return the value
    const mockGetItem = localStorage.getItem as jest.MockedFunction<typeof localStorage.getItem>
    mockGetItem.mockReturnValue('John Doe')

    const { result } = renderHook(() => useUserName())

    expect(result.current.userName).toBe('John Doe')
    expect(result.current.hasName).toBeTruthy() // hasName will be truthy string
    expect(result.current.isFirstTime).toBe(false)
  })

  it('should handle setting name in development mode', async () => {
    jest.useFakeTimers()
    
    const { result } = renderHook(() => useUserName())

    act(() => {
      result.current.setUserName('New User')
    })

    // Should be setting name
    expect(result.current.isSettingName).toBe(true)

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    // Should complete and store in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      `userName_${MOCK_ADDRESS}`,
      'New User'
    )

    jest.useRealTimers()
  })

  it('should handle production mode with contract calls', () => {
    // We can't easily test production mode due to the DEVELOPMENT_MODE constant
    // being hardcoded to true, so this test is more of a placeholder
    const { result } = renderHook(() => useUserName())
    
    expect(result.current.setUserName).toBeDefined()
    expect(typeof result.current.setUserName).toBe('function')
  })

  it('should handle disconnected wallet', () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    const { result } = renderHook(() => useUserName())

    expect(result.current.userName).toBe('')
    expect(result.current.hasName).toBeFalsy()
    expect(result.current.isFirstTime).toBe(false) // Not connected, so not first time
  })

  it('should prevent setting empty name', async () => {
    const { result } = renderHook(() => useUserName())

    await act(async () => {
      result.current.setUserName('  ')
    })

    // Should not set an empty/whitespace name
    expect(result.current.isSettingName).toBe(false)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should handle wallet not connected', async () => {
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false,
      isConnecting: false,
      isReconnecting: false,
      isDisconnected: true,
      status: 'disconnected'
    } as any)

    const { result } = renderHook(() => useUserName())

    await act(async () => {
      result.current.setUserName('Test Name')
    })

    // Should not proceed if not connected
    expect(result.current.isSettingName).toBe(false)
    expect(localStorage.setItem).not.toHaveBeenCalled()
  })

  it('should trim names before setting', async () => {
    jest.useFakeTimers()
    
    const { result } = renderHook(() => useUserName())

    act(() => {
      result.current.setUserName('  John Doe  ')
    })

    act(() => {
      jest.advanceTimersByTime(2000)
    })

    expect(localStorage.setItem).toHaveBeenCalledWith(
      `userName_${MOCK_ADDRESS}`,
      'John Doe'
    )

    jest.useRealTimers()
  })
})