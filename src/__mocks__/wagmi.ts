// Mock addresses for testing
export const MOCK_ADDRESSES = {
  CONNECTED: '0x1234567890123456789012345678901234567890',
  DISCONNECTED: null,
}

// Mock wagmi hooks
export const useAccount = jest.fn(() => ({
  address: MOCK_ADDRESSES.CONNECTED,
  isConnected: true,
  isConnecting: false,
  isReconnecting: false,
  isDisconnected: false,
  status: 'connected',
}))

export const useConnect = jest.fn(() => ({
  connect: jest.fn(),
  connectors: [],
  error: null,
  isLoading: false,
  isPending: false,
  isError: false,
  isSuccess: false,
  reset: jest.fn(),
  status: 'idle',
  variables: undefined,
}))

export const useDisconnect = jest.fn(() => ({
  disconnect: jest.fn(),
  error: null,
  isError: false,
  isIdle: true,
  isLoading: false,
  isPending: false,
  isSuccess: false,
  reset: jest.fn(),
  status: 'idle',
  variables: undefined,
}))

export const useReadContract = jest.fn(() => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  refetch: jest.fn(),
  status: 'idle',
}))

export const useWriteContract = jest.fn(() => ({
  writeContract: jest.fn(),
  data: undefined,
  error: null,
  isError: false,
  isIdle: true,
  isLoading: false,
  isPending: false,
  isSuccess: false,
  reset: jest.fn(),
  status: 'idle',
  variables: undefined,
}))

export const useWaitForTransactionReceipt = jest.fn(() => ({
  data: undefined,
  error: null,
  isError: false,
  isLoading: false,
  isSuccess: false,
  status: 'idle',
}))

// Mock viem utilities
export const formatEther = jest.fn((value: bigint) => {
  return (Number(value) / 1e18).toString()
})

export const parseEther = jest.fn((value: string) => {
  return BigInt(Math.floor(parseFloat(value) * 1e18))
})