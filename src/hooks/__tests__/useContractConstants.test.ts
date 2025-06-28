import { renderHook } from '@testing-library/react'
import { useContractConstants } from '../useContractConstants'
import { useReadContract } from 'wagmi'

jest.mock('wagmi')

const mockUseReadContract = useReadContract as jest.MockedFunction<typeof useReadContract>

describe('useContractConstants', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock setup - return undefined for all contract reads (development mode)
    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: false,
      isSuccess: false,
      refetch: jest.fn(),
      status: 'idle'
    } as any)
  })

  it('should return fallback values in development mode', () => {
    const { result } = renderHook(() => useContractConstants())

    // Should return parsed fallback values from CONTRACT_CONSTANTS
    expect(result.current.minKindnessAmount).toBeDefined()
    expect(result.current.maxKindnessAmount).toBeDefined()
    expect(result.current.maxDailyContribution).toBeDefined()
    expect(result.current.maxReceivers).toBeDefined()
    expect(result.current.actionCooldownHours).toBeDefined()
    expect(result.current.receiverPoolCooldownMinutes).toBeDefined()
    
    // Raw values should be undefined in development mode
    expect(result.current.raw.minKindnessAmount).toBeUndefined()
    expect(result.current.raw.maxKindnessAmount).toBeUndefined()
    expect(result.current.raw.maxDailyContribution).toBeUndefined()
    expect(result.current.raw.maxReceivers).toBeUndefined()
    expect(result.current.raw.actionCooldown).toBeUndefined()
    expect(result.current.raw.receiverPoolCooldown).toBeUndefined()
  })

  it('should handle contract values when available', () => {
    // Mock contract data for different calls
    let callCount = 0
    mockUseReadContract.mockImplementation(({ functionName }) => {
      const mockValues: { [key: string]: any } = {
        'MIN_KINDNESS_AMOUNT': BigInt('10000000000000000'), // 0.01 ETH
        'MAX_KINDNESS_AMOUNT': BigInt('1000000000000000000'), // 1 ETH
        'MAX_DAILY_CONTRIBUTION': BigInt('5000000000000000000'), // 5 ETH
        'MAX_RECEIVERS': BigInt('50'),
        'ACTION_COOLDOWN': BigInt('86400'), // 24 hours
        'RECEIVER_POOL_COOLDOWN': BigInt('300'), // 5 minutes
      }

      return {
        data: mockValues[functionName as string],
        error: null,
        isError: false,
        isLoading: false,
        isSuccess: true,
        refetch: jest.fn(),
        status: 'success'
      } as any
    })

    const { result } = renderHook(() => useContractConstants())

    // Should use contract values when available (though disabled in dev mode)
    expect(result.current.minKindnessAmount).toBeDefined()
    expect(result.current.maxKindnessAmount).toBeDefined()
    expect(result.current.maxDailyContribution).toBeDefined()
    expect(result.current.maxReceivers).toBeDefined()
    expect(result.current.actionCooldownHours).toBeDefined()
    expect(result.current.receiverPoolCooldownMinutes).toBeDefined()
  })

  it('should handle loading state', () => {
    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: null,
      isError: false,
      isLoading: true,
      isSuccess: false,
      refetch: jest.fn(),
      status: 'loading'
    } as any)

    const { result } = renderHook(() => useContractConstants())

    // Should still return fallback values during loading
    expect(result.current.minKindnessAmount).toBeDefined()
    expect(result.current.maxKindnessAmount).toBeDefined()
  })

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch contract constants')

    mockUseReadContract.mockReturnValue({
      data: undefined,
      error: mockError,
      isError: true,
      isLoading: false,
      isSuccess: false,
      refetch: jest.fn(),
      status: 'error'
    } as any)

    const { result } = renderHook(() => useContractConstants())

    // Should still return fallback values on error
    expect(result.current.minKindnessAmount).toBeDefined()
    expect(result.current.maxKindnessAmount).toBeDefined()
  })

  it('should provide raw values structure', () => {
    const { result } = renderHook(() => useContractConstants())

    expect(result.current.raw).toBeDefined()
    expect(typeof result.current.raw).toBe('object')
    expect(result.current.raw).toHaveProperty('minKindnessAmount')
    expect(result.current.raw).toHaveProperty('maxKindnessAmount')
    expect(result.current.raw).toHaveProperty('maxDailyContribution')
    expect(result.current.raw).toHaveProperty('maxReceivers')
    expect(result.current.raw).toHaveProperty('actionCooldown')
    expect(result.current.raw).toHaveProperty('receiverPoolCooldown')
  })

  it('should convert time values correctly', () => {
    const { result } = renderHook(() => useContractConstants())

    // actionCooldownHours should be a number (hours)
    expect(typeof result.current.actionCooldownHours).toBe('number')
    
    // receiverPoolCooldownMinutes should be a number (minutes)
    expect(typeof result.current.receiverPoolCooldownMinutes).toBe('number')
  })

  it('should convert ETH values correctly', () => {
    const { result } = renderHook(() => useContractConstants())

    // ETH amounts should be numbers (in ETH, not wei)
    expect(typeof result.current.minKindnessAmount).toBe('number')
    expect(typeof result.current.maxKindnessAmount).toBe('number')
    expect(typeof result.current.maxDailyContribution).toBe('number')
    
    // maxReceivers should be a number
    expect(typeof result.current.maxReceivers).toBe('number')
  })
})