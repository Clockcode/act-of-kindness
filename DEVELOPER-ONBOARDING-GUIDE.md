# Random Act of Kindness - Developer Onboarding Guide

A comprehensive guide for developers joining the Random Act of Kindness project.

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Directory Structure & File Organization](#2-directory-structure--file-organization)  
3. [Core Components & Their Responsibilities](#3-core-components--their-responsibilities)
4. [Application Flow & User Journeys](#4-application-flow--user-journeys)
5. [Data Models & Smart Contract Schema](#5-data-models--smart-contract-schema)
6. [API Documentation](#6-api-documentation)
7. [Configuration & Environment](#7-configuration--environment)
8. [Testing Strategy](#8-testing-strategy)
9. [Common Patterns & Conventions](#9-common-patterns--conventions)
10. [Troubleshooting Guide](#10-troubleshooting-guide)
11. [Future Considerations](#11-future-considerations)

---

## 1. Project Overview

### Purpose & Goals

The Random Act of Kindness application is a **daily kindness economy** built as a Farcaster Mini App. It solves the problem of fostering genuine community kindness through a transparent, blockchain-based mutual aid system.

**Core Concept**: Users contribute ETH to a shared daily pool, and at the end of each day, the pool is randomly distributed among users who opted to receive (but didn't contribute that day).

### Target Users

- **Primary**: Farcaster users within the social frame ecosystem
- **Secondary**: Web3 users accessing directly via browser
- **Context**: Daily social interaction, community building, mutual aid

**User Personas**:
- **Daily Givers**: Regular contributors who derive satisfaction from giving
- **Occasional Receivers**: Users who occasionally need financial assistance  
- **Community Builders**: Users who promote the app and onboard others
- **Whale Contributors**: Users who make larger contributions to boost the pool

### Technology Stack

#### Frontend Framework
- **Next.js 15.3.2** - App Router with React Server Components
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Comprehensive type safety

#### Blockchain Integration  
- **Wagmi 2.15.3** - React hooks for Ethereum
- **Viem 2.29.3** - TypeScript Ethereum library (wagmi's foundation)
- **Smart Contracts** - Custom Solidity contracts for pool management

#### Farcaster Integration
- **@farcaster/frame-sdk 0.0.41** - Official Farcaster Mini App SDK
- **Frame Metadata** - Open Graph tags for frame discovery
- **Webhook System** - Real-time Farcaster event processing

#### UI & Styling
- **TailwindCSS 4** - Utility-first CSS framework
- **DaisyUI 5.0.35** - Component library built on Tailwind
- **Responsive Design** - Mobile-first approach for Farcaster frames

#### State Management
- **@tanstack/react-query 5.76.1** - Server state management
- **React Context** - Global state for wallet and Farcaster context
- **Local Storage** - Development mode persistence

#### External Services
- **@upstash/redis 1.34.9** - Notification system backend
- **ngrok** - Local development tunneling for Farcaster testing

### Architecture Pattern

**Hybrid Architecture**: Combines traditional web app patterns with blockchain-native patterns:

- **Frontend**: Next.js App Router (SSR/CSR hybrid)
- **State Management**: React Query + Context (CQRS-like pattern)
- **Blockchain Layer**: Smart contract business logic with UI validation
- **External Services**: Microservices pattern for notifications
- **Development**: Mock-first development with production blockchain integration

### Development Setup

#### Prerequisites
```bash
# Required versions
Node.js >= 18.0.0
Yarn >= 1.22.0
Git >= 2.0.0

# Recommended tools
VS Code with TypeScript/React extensions
MetaMask or similar Web3 wallet
ngrok account for Farcaster testing
```

#### Step-by-Step Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd act-of-kindness
   yarn install
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Configure required variables
   NEXT_PUBLIC_APP_DOMAIN=localhost:3001
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   
   # Optional: Redis for notifications
   REDIS_URL=your_upstash_redis_url
   REDIS_TOKEN=your_upstash_token
   ```

3. **Development Mode**
   ```bash
   # Start development server
   yarn dev
   
   # In separate terminal: Start tunnel for Farcaster testing
   yarn tunnel
   ```

4. **Verification**
   - Open http://localhost:3001
   - Connect wallet (MetaMask recommended)
   - Verify all components load without errors
   - Test basic functionality in development mode

5. **Testing Setup**
   ```bash
   # Run test suite
   yarn test
   
   # Run with coverage
   yarn test:coverage
   
   # Watch mode for development
   yarn test:watch
   ```

---

## 2. Directory Structure & File Organization

### Visual Tree Structure

```
act-of-kindness/
├── 📄 Configuration & Documentation
│   ├── package.json                 # Dependencies & scripts
│   ├── next.config.ts               # Next.js configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── jest.config.js              # Test configuration
│   ├── eslint.config.mjs           # Linting rules
│   ├── postcss.config.mjs          # PostCSS configuration
│   ├── README.md                   # Basic setup guide
│   ├── CLAUDE.md                   # AI development instructions
│   ├── ERROR-ANALYSIS.md           # Known issues & solutions
│   └── DEVELOPER-ONBOARDING-GUIDE.md # This file
│
├── 🌐 Public Assets
│   └── public/
│       ├── favicon.ico             # Browser favicon
│       ├── icon.png                # Farcaster app icon (1024x1024)
│       ├── image.png               # Farcaster frame image (1200x800)
│       └── og.png                  # Open Graph image
│
└── 💻 Source Code
    └── src/
        ├── 🎨 Global Styles
        │   └── assets/globals.css   # TailwindCSS imports & custom styles
        │
        ├── 🧪 Testing Infrastructure
        │   ├── __mocks__/wagmi.ts   # Mock Wagmi hooks for testing
        │   └── __tests__/integration/user-flow.test.tsx
        │
        ├── 📱 Next.js App Router
        │   └── app/
        │       ├── layout.tsx       # Root layout with metadata
        │       ├── page.tsx         # Main application page
        │       ├── __tests__/page.test.tsx
        │       └── api/webhook/route.ts # Farcaster webhook endpoint
        │
        ├── 🧩 React Components
        │   ├── layout.tsx           # App layout wrapper
        │   └── client/              # Client-side components
        │       ├── ErrorFilter.tsx         # Error suppression utility
        │       ├── WalletProviderResolver.tsx # Wallet conflict detection
        │       ├── WalletConnect/           # Wallet connection UI
        │       │   ├── index.tsx
        │       │   └── __tests__/index.test.tsx
        │       ├── GiveKindnessModal/       # ETH contribution interface
        │       │   ├── index.tsx
        │       │   └── __tests__/index.test.tsx
        │       ├── ReceiveKindnessModal/    # Receiver pool management
        │       │   ├── index.tsx
        │       │   └── __tests__/index.test.tsx
        │       ├── PoolDashboard/           # Statistics display
        │       │   └── index.tsx
        │       ├── UserNameInput/           # User onboarding
        │       │   ├── index.tsx
        │       │   └── __tests__/index.test.tsx
        │       └── [Other Components]/     # Additional UI components
        │
        ├── 🌐 Context Providers (Global State)
        │   ├── index.tsx            # Provider composition
        │   ├── query.tsx            # React Query + Wagmi setup
        │   └── farcaster.tsx        # Farcaster SDK initialization
        │
        ├── 🔗 Blockchain Integration
        │   └── contracts/kindness-pool.ts # Contract ABIs & addresses
        │
        ├── 🪝 Custom React Hooks
        │   ├── useContractConstants.ts    # Dynamic contract constants
        │   ├── useUserName.ts             # User profile management
        │   ├── useFarcasterContext.ts     # Farcaster SDK wrapper
        │   ├── useFarcasterAccount.ts     # Account association
        │   ├── useFrameAdded.ts           # Frame installation status
        │   ├── useIsFarcasterApp.ts       # Environment detection
        │   ├── useOpenFrameUrl.ts         # Frame navigation
        │   ├── useAddFrame.ts             # Frame installation
        │   └── __tests__/                 # Hook unit tests
        │
        ├── 🌐 External Service Clients
        │   └── clients/
        │       ├── redis.ts               # Upstash Redis client
        │       ├── notification-client.ts # Notification service
        │       └── notification.ts        # Notification utilities
        │
        └── ⚙️ Configuration & Utilities
            └── utils/config.ts        # App constants & environment
```

### Directory Responsibilities

#### 📱 `/src/app/` - Next.js App Router
**Purpose**: Route definitions and API endpoints using Next.js 15 App Router
- `layout.tsx`: Root layout with Farcaster frame metadata
- `page.tsx`: Main application page with wallet connection flow
- `api/webhook/route.ts`: Farcaster event webhook handler

#### 🧩 `/src/components/` - UI Components
**Purpose**: Reusable React components organized by functionality
- **Client Components**: Interactive UI requiring client-side JavaScript
- **Test Coverage**: Each component has comprehensive test suites
- **Naming Convention**: PascalCase directories with index.tsx entry points

#### 🌐 `/src/context/` - Global State Management
**Purpose**: React Context providers for application-wide state
- **Query Provider**: React Query configuration with Wagmi integration
- **Farcaster Provider**: SDK initialization and global Farcaster state
- **Composition Pattern**: All providers composed in index.tsx

#### 🔗 `/src/contracts/` - Blockchain Integration
**Purpose**: Smart contract interfaces and blockchain configuration
- **ABIs**: Contract Application Binary Interfaces
- **Addresses**: Contract deployment addresses for different networks
- **Constants**: Default values and fallback configuration

#### 🪝 `/src/hooks/` - Custom React Hooks
**Purpose**: Reusable business logic and external service integrations
- **Naming Convention**: useXxx pattern following React conventions
- **Single Responsibility**: Each hook handles one specific concern
- **Testing**: Comprehensive unit tests for all custom hooks

### Naming Conventions

#### Files & Directories
- **Components**: PascalCase directories (`GiveKindnessModal/`)
- **Hooks**: camelCase files (`useContractConstants.ts`)
- **Utilities**: camelCase files (`config.ts`)
- **Tests**: `__tests__` directories with `.test.tsx` suffix

#### Code Conventions
- **Variables**: camelCase (`isConnected`, `userStats`)
- **Functions**: camelCase (`handleSubmit`, `fetchUserData`)
- **Components**: PascalCase (`GiveKindnessModal`, `WalletConnect`)
- **Constants**: UPPER_SNAKE_CASE (`KINDNESS_POOL_ADDRESS`)

---

## 3. Core Components & Their Responsibilities

### 3.1 Main Application Components

#### **HomePage** (`/src/app/page.tsx`)
**Purpose**: Main application orchestrator and user flow coordinator

**Key Features**:
- Hydration mismatch prevention with client-side rendering guard
- Conditional rendering based on wallet connection and user state
- Modal state management for all user interactions
- Integration point for all major components

**Dependencies**:
- `useAccount` (Wagmi) - Wallet connection state
- `useUserName` - User profile management
- All modal components for user interactions

**Data Flow**:
```typescript
App Load → Hydration Check → Wallet Status → User State → Render Appropriate UI
                                ↓
                     Connected → Has Name → Show Actions
                                ↓
                     Not Connected → Show Connection Flow
                                ↓
                     Connected + No Name → Show Onboarding
```

**Error Handling**:
- `WalletProviderResolver` for wallet extension conflicts
- `ErrorFilter` for browser extension noise suppression
- Graceful degradation for loading states

#### **GiveKindnessModal** (`/src/components/client/GiveKindnessModal/index.tsx`)
**Purpose**: Handles ETH contributions to the kindness pool with comprehensive validation

**Key Methods**:
```typescript
// Main contribution handler
const handleGiveKindness = async () => {
  // Validate wallet connection
  // Validate contribution amount and limits
  // Execute blockchain transaction
  // Handle success/error states
}

// Real-time limit validation
const validateAmount = (amount: string) => {
  // Check minimum/maximum per transaction
  // Check daily contribution limits
  // Check user eligibility and cooldowns
}
```

**Dependencies**:
- `useContractConstants` - Dynamic contract limits
- `useReadContract` - User statistics and limits
- `useWriteContract` - Transaction execution
- `useWaitForTransactionReceipt` - Transaction monitoring

**State Management**:
```typescript
// Local state
const [amount, setAmount] = useState('')
const [isSuccess, setIsSuccess] = useState(false)

// Contract interaction
const { writeContract, isPending } = useWriteContract()
const { isLoading: isConfirming } = useWaitForTransactionReceipt()
```

**Business Logic**:
- Contribution limits: 0.001 - 1 ETH per transaction
- Daily limits: Maximum 5 ETH per user per day
- Cooldown enforcement: 1-hour between actions
- Mutual exclusivity: Cannot contribute and receive same day

#### **ReceiveKindnessModal** (`/src/components/client/ReceiveKindnessModal/index.tsx`)
**Purpose**: Manages entry and exit from the daily receiver pool

**Key Features**:
- Live pool status with auto-refresh (3-5 second intervals)
- Real-time eligibility checking
- Development mode with mock data for testing
- Dual transaction support (enter/leave pool)

**Methods**:
```typescript
const handleEnterPool = async () => {
  // Validate eligibility (not contributed today, not in pool)
  // Check pool capacity (max 100 receivers)
  // Execute enterReceiverPool transaction
}

const handleLeavePool = async () => {
  // Validate can leave (in pool, within cooldown)
  // Execute leaveReceiverPool transaction
}
```

**Auto-refresh Logic**:
```typescript
// Live data updates
const { data: poolStatus, refetch } = useReadContract({
  address: KINDNESS_POOL_ADDRESS,
  abi: KINDNESS_POOL_ABI,
  functionName: 'getPoolStatus',
  query: { 
    refetchInterval: 3000, // 3 seconds
    enabled: isOpen 
  }
})
```

#### **PoolDashboard** (`/src/components/client/PoolDashboard/index.tsx`)
**Purpose**: Comprehensive statistics display for pool status and user metrics

**Data Sources**:
- **Pool Statistics**: Daily pool amount, receiver count, unclaimed funds
- **User Daily Stats**: Today's contributions, remaining limits, withdrawable amount
- **User Lifetime Stats**: Total given, total received, net balance
- **Real-time Updates**: All data refreshes automatically on block changes

**Responsive Design**:
```typescript
// Adaptive layouts
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Desktop: 3 columns, Mobile: 1 column */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Desktop: 4 cols, Tablet: 2 cols, Mobile: 1 col */}
</div>
```

### 3.2 Custom Hooks Architecture

#### **useContractConstants** (`/src/hooks/useContractConstants.ts`)
**Purpose**: Fetches dynamic contract configuration with intelligent fallbacks

**Features**:
- Development/production mode switching
- Automatic unit conversion (Wei ↔ ETH, seconds ↔ hours)
- Fallback to static constants if contract calls fail
- Raw values provided for direct contract interactions

**Return Values**:
```typescript
interface ContractConstants {
  // User-friendly formats
  minKindnessAmount: number       // 0.001 (ETH)
  maxKindnessAmount: number       // 1.0 (ETH)
  maxDailyContribution: number    // 5.0 (ETH)
  maxReceivers: number            // 100
  actionCooldownHours: number     // 1
  receiverPoolCooldownMinutes: number // 30
  
  // Raw values for contract calls
  raw: {
    minKindnessAmount: bigint     // Wei values
    maxKindnessAmount: bigint
    // ... other raw values
  }
}
```

**Usage Pattern**:
```typescript
const constants = useContractConstants()

// UI display
<p>Min contribution: {constants.minKindnessAmount} ETH</p>

// Contract interaction
writeContract({
  abi: KINDNESS_POOL_ABI,
  functionName: 'giveKindness',
  value: constants.raw.minKindnessAmount
})
```

#### **useUserName** (`/src/hooks/useUserName.ts`)
**Purpose**: User profile name management with blockchain/localStorage persistence

**Features**:
- Development mode: localStorage persistence keyed by wallet address
- Production mode: Blockchain storage via UserRegistry contract
- Automatic refetching after successful name setting transactions
- First-time user detection for onboarding flow

**State Management**:
```typescript
interface UserNameState {
  userName: string | null           // Current user's name
  hasName: boolean                  // Whether user has set a name
  isFirstTime: boolean              // First-time user detection
  isLoading: boolean                // Loading state
  setName: (name: string) => Promise<void> // Name setting function
}
```

### 3.3 Context Providers

#### **QueryProvider** (`/src/context/query.tsx`)
**Purpose**: Centralized React Query and Wagmi configuration

**Configuration**:
```typescript
// Wagmi configuration
const config = createConfig({
  chains: [localhost, mainnet, base],
  connectors: [injected()],
  transports: {
    [localhost.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
    },
  },
})
```

**Integration**:
```typescript
export function QueryProvider({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

#### **FarcasterProvider** (`/src/context/farcaster.tsx`)
**Purpose**: Farcaster SDK initialization and global state management

**Implementation**:
```typescript
export function FarcasterProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    sdk.actions.ready().then(() => {
      console.log("Farcaster SDK ready...")
    })
  }, [])

  return <>{children}</>
}
```

---

## 4. Application Flow & User Journeys

### 4.1 Main User Flows

#### First-Time User Onboarding
```
App Entry → Hydration → Wallet Check → Connection → Name Setup → Actions Available
    ↓
Loading State (prevents hydration mismatch)
    ↓
Wallet Connection Required
    ↓
"Connect Your Wallet to Get Started"
    ↓
Wallet Connection Success
    ↓
"Welcome to the Kindness Community!" 
    ↓
Name Input Modal → Blockchain Transaction → Success → Main Interface
```

**Code Flow**:
```typescript
// Main conditional rendering logic
if (!isClient) return <LoadingState />
if (!isConnected) return <WalletConnectionFlow />
if (isFirstTime) return <OnboardingFlow />
return <MainActions /> // Give/Receive buttons + Dashboard
```

#### Daily Giver Journey
```
Return Visit → Welcome Message → View Stats → Give Kindness → Transaction → Success
```

**Detailed Steps**:
1. **Recognition**: "Welcome back, {userName}! 👋"
2. **Context**: Current pool status, personal stats
3. **Action**: Click "Give Kindness" → Modal opens
4. **Validation**: Real-time amount validation against limits
5. **Transaction**: Wallet confirmation → Blockchain processing
6. **Confirmation**: Success modal with options to continue

#### Daily Receiver Journey
```
Return Visit → Check Eligibility → Enter Pool → Wait for Distribution
```

**Eligibility Requirements**:
- Must not have contributed today (mutual exclusivity)
- Pool not at maximum capacity (100 receivers)
- Not already in receiver pool
- Respect cooldown periods (30 minutes between changes)

### 4.2 State Transitions

#### Wallet Connection States
```typescript
enum WalletState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  ERROR = 'error'
}

// Transition logic
const handleConnect = async () => {
  setState(WalletState.CONNECTING)
  try {
    await connect()
    setState(WalletState.CONNECTED)
  } catch (error) {
    setState(WalletState.ERROR)
  }
}
```

#### Transaction States
```typescript
enum TransactionState {
  IDLE = 'idle',
  VALIDATING = 'validating',
  PENDING = 'pending',        // User confirmation needed
  CONFIRMING = 'confirming',  // Blockchain processing
  SUCCESS = 'success',
  ERROR = 'error'
}
```

#### Modal State Management
```typescript
// Centralized modal state
const [modalState, setModalState] = useState({
  give: false,
  receive: false,
  nameInput: false
})

// Auto-close logic
useEffect(() => {
  if (modalState.nameInput && hasName) {
    setModalState(prev => ({ ...prev, nameInput: false }))
  }
}, [modalState.nameInput, hasName])
```

### 4.3 Error Flows and Recovery

#### Transaction Error Recovery
```typescript
const handleTransactionError = (error: Error) => {
  // Parse error type
  if (error.message.includes('User rejected')) {
    showMessage('Transaction cancelled by user')
    // Keep modal open for retry
  } else if (error.message.includes('insufficient funds')) {
    showMessage('Insufficient ETH balance')
    // Suggest checking wallet balance
  } else {
    showMessage('Transaction failed. Please try again.')
    // Log technical details for debugging
  }
}
```

#### Network Error Handling
```typescript
// React Query error boundaries
const { data, error, refetch } = useReadContract({
  // ... config
  retry: (failureCount, error) => {
    // Retry network errors, not contract errors
    return failureCount < 3 && error.message.includes('network')
  }
})

if (error) {
  return <ErrorState onRetry={refetch} />
}
```

---

## 5. Data Models & Smart Contract Schema

### 5.1 Smart Contract Architecture

#### KindnessPool Contract
**Primary Functions**:
```solidity
// Core business logic
function giveKindness() external payable
function enterReceiverPool() external
function leaveReceiverPool() external
function withdrawContribution(uint256 amount) external

// View functions
function getDailyPool() external view returns (uint256)
function getReceiverCount() external view returns (uint256)
function getUserDailyStats(address user) external view returns (UserDailyStats)
function getRemainingDailyContribution(address user) external view returns (uint256)
```

**Data Structures**:
```solidity
struct UserDailyStats {
    uint256 contributedToday;    // Amount contributed today
    uint256 withdrawnToday;      // Amount withdrawn today
    uint256 lastActionTime;      // Timestamp of last action
    bool inReceiverPool;         // Currently in receiver pool
}

struct PoolStats {
    uint256 dailyPool;           // Today's total pool
    uint256 receiverCount;       // Current receiver count
    uint256 unclaimedFunds;      // Failed distribution funds
    uint256 lastDistribution;    // Last distribution timestamp
}
```

#### UserRegistry Contract
**Purpose**: User profile and historical statistics management

```solidity
struct UserProfile {
    string name;                 // Display name (max 32 chars)
    uint256 totalGiven;         // Lifetime contributions
    uint256 totalReceived;      // Lifetime distributions received
    uint256 timesReceived;      // Number of times received
    uint256 registrationTime;   // Account creation timestamp
    bool isActive;              // Account status
}

// Key functions
function setName(string calldata name) external
function getUserStats(address user) external view returns (UserProfile)
function isInReceiverPool(address user) external view returns (bool)
```

### 5.2 Frontend Data Models

#### User State Interface
```typescript
interface UserState {
  // Wallet connection
  address: `0x${string}` | undefined
  isConnected: boolean
  
  // Profile information
  userName: string | null
  hasName: boolean
  isFirstTime: boolean
  
  // Daily statistics
  dailyStats: {
    contributedToday: bigint
    remainingLimit: bigint
    withdrawableAmount: bigint
    inReceiverPool: boolean
    lastActionTime: bigint
  }
  
  // Lifetime statistics
  lifetimeStats: {
    totalGiven: bigint
    totalReceived: bigint
    timesReceived: bigint
    netBalance: bigint
  }
}
```

#### Pool State Interface
```typescript
interface PoolState {
  // Current pool status
  dailyPool: bigint
  receiverCount: number
  maxReceivers: number
  unclaimedFunds: bigint
  
  // Contract constants
  constants: {
    minKindnessAmount: number
    maxKindnessAmount: number
    maxDailyContribution: number
    actionCooldownHours: number
    receiverPoolCooldownMinutes: number
  }
  
  // Time-based information
  lastDistribution: Date
  nextDistribution: Date
  timeUntilDistribution: number
}
```

### 5.3 Data Validation Rules

#### Input Validation
```typescript
// Contribution amount validation
const validateContribution = (amount: string, userStats: UserStats) => {
  const amountNum = parseFloat(amount)
  const remainingLimit = parseFloat(formatEther(userStats.remainingLimit))
  
  if (!amount || amountNum <= 0) return 'Amount is required'
  if (amountNum < constants.minKindnessAmount) return `Minimum ${constants.minKindnessAmount} ETH`
  if (amountNum > constants.maxKindnessAmount) return `Maximum ${constants.maxKindnessAmount} ETH per transaction`
  if (amountNum > remainingLimit) return `Exceeds daily limit. Remaining: ${remainingLimit} ETH`
  
  return null // Valid
}

// Name validation
const validateName = (name: string) => {
  if (!name.trim()) return 'Name is required'
  if (name.length > 32) return 'Name must be 32 characters or less'
  if (!/^[a-zA-Z0-9\s]+$/.test(name)) return 'Name can only contain letters, numbers, and spaces'
  
  return null // Valid
}
```

#### Business Rule Enforcement
```typescript
// Receiver pool eligibility
const checkReceiverEligibility = (userStats: UserStats, poolStats: PoolStats) => {
  if (userStats.contributedToday > 0) {
    return { eligible: false, reason: 'Cannot receive on days you contribute' }
  }
  
  if (poolStats.receiverCount >= poolStats.maxReceivers) {
    return { eligible: false, reason: 'Receiver pool is full' }
  }
  
  if (userStats.inReceiverPool) {
    return { eligible: false, reason: 'Already in receiver pool' }
  }
  
  const cooldownRemaining = calculateCooldown(userStats.lastActionTime)
  if (cooldownRemaining > 0) {
    return { eligible: false, reason: `Cooldown active: ${cooldownRemaining} minutes remaining` }
  }
  
  return { eligible: true, reason: null }
}
```

---

## 6. API Documentation

### 6.1 Farcaster Webhook API

#### **POST `/api/webhook`**
**Purpose**: Handles Farcaster frame events and manages user notifications

**Request Format**:
```typescript
interface WebhookRequest {
  type: 'frame_added' | 'frame_removed'
  data: {
    fid: number                    // Farcaster user ID
    timestamp: number              // Event timestamp
    frame_url: string              // Frame URL
    added_by: {
      fid: number
      username: string
    }
  }
}
```

**Response Format**:
```typescript
interface WebhookResponse {
  success: boolean
  message?: string
  data?: {
    notification_sent: boolean
    user_preferences_updated: boolean
  }
}
```

**Implementation Details**:
```typescript
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate Farcaster signature
    const isValid = await validateFarcasterSignature(body)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
    
    // Handle different event types
    switch (body.type) {
      case 'frame_added':
        await handleFrameAdded(body.data)
        break
      case 'frame_removed':
        await handleFrameRemoved(body.data)
        break
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

**Event Handlers**:
```typescript
const handleFrameAdded = async (data: FrameAddedData) => {
  // Store user preferences in Redis
  await redis.hset(`user:${data.fid}`, {
    notifications_enabled: true,
    frame_added_at: Date.now(),
    username: data.added_by.username
  })
  
  // Send welcome notification
  await sendNotification(data.fid, {
    title: 'Welcome to Random Acts of Kindness!',
    body: 'Start spreading kindness in the community.',
    action_url: process.env.NEXT_PUBLIC_APP_URL
  })
}
```

### 6.2 Smart Contract Interfaces

#### Contract Read Operations
```typescript
// Pool statistics (auto-refreshing)
const { data: poolStats } = useReadContract({
  address: KINDNESS_POOL_ADDRESS,
  abi: KINDNESS_POOL_ABI,
  functionName: 'getPoolStats',
  query: { 
    refetchInterval: 5000,  // 5 seconds
    staleTime: 3000 
  }
})

// User daily statistics
const { data: userStats } = useReadContract({
  address: KINDNESS_POOL_ADDRESS,
  abi: KINDNESS_POOL_ABI,
  functionName: 'getUserDailyStats',
  args: [address],
  query: { enabled: !!address }
})
```

#### Contract Write Operations
```typescript
// Contribution transaction
const { writeContract, isPending } = useWriteContract()

const handleContribute = async (amount: string) => {
  writeContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'giveKindness',
    value: parseEther(amount),
    args: [] // No additional arguments
  })
}

// Transaction monitoring
const { isLoading: isConfirming } = useWaitForTransactionReceipt({
  hash: transactionHash
})
```

### 6.3 External Service APIs

#### Redis Notification System
```typescript
// Store user notification preferences
await redis.hset(`user:${fid}`, {
  notifications_enabled: true,
  daily_summary: false,
  contribution_alerts: true,
  distribution_alerts: true
})

// Retrieve user preferences
const preferences = await redis.hgetall(`user:${fid}`)

// Queue notification for delivery
await redis.lpush('notification_queue', JSON.stringify({
  fid,
  title: 'Daily Distribution Complete',
  body: `You received 0.15 ETH from today's kindness pool!`,
  timestamp: Date.now()
}))
```

---

## 7. Configuration & Environment

### 7.1 Environment Variables

#### Required Configuration
```bash
# Application URLs
NEXT_PUBLIC_APP_DOMAIN=randomactofkindness.com
NEXT_PUBLIC_APP_URL=https://randomactofkindness.com

# Used for Farcaster frame metadata and webhook URLs
# Must be publicly accessible for Farcaster integration
```

#### Optional Configuration
```bash
# Redis (Upstash) for notifications
REDIS_URL=redis://localhost:6379
REDIS_TOKEN=your_redis_token

# Farcaster Account Association (for publishing)
FARCASTER_ACCOUNT_ASSOCIATION_HEADER=
FARCASTER_ACCOUNT_ASSOCIATION_PAYLOAD=
FARCASTER_ACCOUNT_ASSOCIATION_SIGNATURE=
```

#### Development Environment
```bash
# Local development settings
NEXT_PUBLIC_APP_DOMAIN=localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001

# ngrok tunnel for Farcaster testing
NGROK_AUTHTOKEN=your_ngrok_token
```

### 7.2 Configuration Files

#### **next.config.ts**
```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all HTTPS images
      },
    ],
  },
}
```

#### **src/utils/config.ts** - Central Configuration
```typescript
// Application Constants
export const APP_NAME = 'Random Act of Kindness'
export const APP_DESCRIPTION = 'A daily kindness economy powered by blockchain'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3001'

// Farcaster Configuration
export const APP_FRAME_VERSION = 'next'
export const APP_IMAGE = `${APP_URL}/image.png`         // 1200x800
export const APP_ICON = `${APP_URL}/icon.png`           // 1024x1024
export const APP_OG_IMAGE = `${APP_URL}/og.png`

// Cache Configuration
export const DEFAULT_CACHE_TIME = 1000 * 60 * 5 // 5 minutes

// Development Mode Toggle
export const DEVELOPMENT_MODE = process.env.NODE_ENV === 'development'
```

#### **Contract Configuration**
```typescript
// Contract Addresses (configured per network)
export const KINDNESS_POOL_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
export const USER_REGISTRY_ADDRESS = '0xCafac3dD18aC6c6e92c921884f9E4176737C052c'
export const TIME_DISTRIBUTOR_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'

// Fallback Constants (when contract calls fail)
export const CONTRACT_CONSTANTS = {
  MIN_KINDNESS_AMOUNT: '0.001',    // ETH
  MAX_KINDNESS_AMOUNT: '1.0',      // ETH  
  MAX_DAILY_CONTRIBUTION: '5.0',   // ETH
  MAX_RECEIVERS: '100',            // Number
  ACTION_COOLDOWN: '3600',         // Seconds (1 hour)
  RECEIVER_POOL_COOLDOWN: '1800'   // Seconds (30 minutes)
}
```

### 7.3 Feature Flags & Conditional Logic

#### Development vs Production Modes
```typescript
// Hook implementation with mode switching
export function useContractConstants() {
  const { data: minAmount } = useReadContract({
    address: KINDNESS_POOL_ADDRESS,
    abi: KINDNESS_POOL_ABI,
    functionName: 'MIN_KINDNESS_AMOUNT',
    query: { enabled: !DEVELOPMENT_MODE } // Skip contract calls in dev
  })
  
  return {
    minKindnessAmount: DEVELOPMENT_MODE 
      ? parseFloat(CONTRACT_CONSTANTS.MIN_KINDNESS_AMOUNT)
      : minAmount ? parseFloat(formatEther(minAmount)) : 0.001
  }
}
```

#### Environment-Specific Behavior
```typescript
// User name persistence strategy
export function useUserName() {
  const getStoredName = useCallback(() => {
    if (DEVELOPMENT_MODE) {
      // Use localStorage in development
      return localStorage.getItem(`userName_${address}`)
    } else {
      // Use blockchain in production
      return fetchNameFromContract(address)
    }
  }, [address])
}
```

### 7.4 Deployment Environments

#### Development Environment
- **URL**: http://localhost:3001
- **Blockchain**: Localhost/hardhat network
- **Data**: Mock data with localStorage persistence
- **Tunnel**: ngrok for Farcaster frame testing

#### Staging Environment  
- **URL**: https://staging.randomactofkindness.com
- **Blockchain**: Testnet (Sepolia/Base Goerli)
- **Data**: Real contracts with test ETH
- **Features**: Full production functionality with test data

#### Production Environment
- **URL**: https://randomactofkindness.com
- **Blockchain**: Mainnet/Base Mainnet
- **Data**: Real contracts with real ETH
- **Monitoring**: Full error tracking and analytics

---

## 8. Testing Strategy

### 8.1 Testing Approach

#### Testing Philosophy
- **Unit Tests**: Individual components and hooks in isolation
- **Integration Tests**: Component interactions and user flows
- **Contract Tests**: Blockchain interaction testing with mocks
- **E2E Tests**: Complete user journeys (planned)

#### Coverage Expectations
- **Components**: 90%+ coverage for all UI components
- **Hooks**: 100% coverage for custom business logic hooks
- **Integration**: Critical user flows covered
- **Error Handling**: All error states tested

### 8.2 Test Configuration

#### **jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

#### **jest.setup.js** - Test Environment Setup
```javascript
import '@testing-library/jest-dom'

// Mock Wagmi hooks for testing
jest.mock('wagmi', () => require('./__mocks__/wagmi'))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
})
```

### 8.3 Component Testing Examples

#### **GiveKindnessModal Test**
```typescript
describe('GiveKindnessModal', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock returns
    mockUseAccount.mockReturnValue({
      address: '0x123',
      isConnected: true
    })
    
    mockUseContractConstants.mockReturnValue({
      minKindnessAmount: 0.001,
      maxKindnessAmount: 1.0,
      maxDailyContribution: 5.0
    })
  })

  it('validates contribution amounts correctly', async () => {
    render(<GiveKindnessModal onClose={jest.fn()} />)
    
    const input = screen.getByLabelText(/amount/i)
    
    // Test minimum validation
    await user.type(input, '0.0005')
    expect(screen.getByText(/minimum.*0.001 ETH/i)).toBeInTheDocument()
    
    // Test maximum validation
    await user.clear(input)
    await user.type(input, '2.0')
    expect(screen.getByText(/maximum.*1 ETH/i)).toBeInTheDocument()
    
    // Test valid amount
    await user.clear(input)
    await user.type(input, '0.5')
    expect(screen.queryByText(/minimum|maximum/i)).not.toBeInTheDocument()
  })

  it('handles transaction success flow', async () => {
    const onClose = jest.fn()
    
    // Mock successful transaction
    mockUseWriteContract.mockReturnValue({
      writeContract: jest.fn(),
      isPending: false
    })
    
    mockUseWaitForTransactionReceipt.mockReturnValue({
      isLoading: false,
      isSuccess: true
    })
    
    render(<GiveKindnessModal onClose={onClose} />)
    
    // Fill form and submit
    await user.type(screen.getByLabelText(/amount/i), '0.5')
    await user.click(screen.getByRole('button', { name: /give kindness/i }))
    
    // Verify success state
    expect(screen.getByText(/kindness sent successfully/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send more/i })).toBeInTheDocument()
  })
})
```

#### **Hook Testing Example**
```typescript
describe('useContractConstants', () => {
  it('returns development constants when in dev mode', () => {
    // Mock development environment
    process.env.NODE_ENV = 'development'
    
    const { result } = renderHook(() => useContractConstants())
    
    expect(result.current.minKindnessAmount).toBe(0.001)
    expect(result.current.maxKindnessAmount).toBe(1.0)
    expect(result.current.maxDailyContribution).toBe(5.0)
  })

  it('fetches constants from contract in production', async () => {
    process.env.NODE_ENV = 'production'
    
    mockUseReadContract.mockReturnValue({
      data: parseEther('0.002'), // 0.002 ETH in Wei
      isLoading: false
    })
    
    const { result } = renderHook(() => useContractConstants())
    
    await waitFor(() => {
      expect(result.current.minKindnessAmount).toBe(0.002)
    })
  })
})
```

### 8.4 Integration Testing

#### **User Flow Integration Test**
```typescript
describe('Complete User Onboarding Flow', () => {
  it('handles new user complete journey', async () => {
    // Mock wallet not connected initially
    mockUseAccount.mockReturnValue({
      address: undefined,
      isConnected: false
    })
    
    render(<Home />)
    
    // Should show wallet connection prompt
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument()
    
    // Mock wallet connection
    await act(async () => {
      mockUseAccount.mockReturnValue({
        address: '0x123',
        isConnected: true
      })
      
      // Trigger re-render
      rerender(<Home />)
    })
    
    // Should show name setup for first-time user
    expect(screen.getByText(/welcome to the kindness community/i)).toBeInTheDocument()
    
    // Complete name setup
    await user.click(screen.getByRole('button', { name: /set your name/i }))
    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Mock name setting success
    await act(async () => {
      mockUseUserName.mockReturnValue({
        userName: 'John Doe',
        hasName: true,
        isFirstTime: false
      })
      
      rerender(<Home />)
    })
    
    // Should show main action buttons
    expect(screen.getByRole('button', { name: /give kindness/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /receive kindness/i })).toBeInTheDocument()
  })
})
```

### 8.5 Running Tests

#### Test Commands
```bash
# Run all tests
yarn test

# Run tests in watch mode (for development)
yarn test:watch

# Run tests with coverage report
yarn test:coverage

# Run specific test file
yarn test GiveKindnessModal

# Run specific test pattern
yarn test --testNamePattern="validates contribution amounts"
```

#### Coverage Reports
```bash
# Generated coverage report includes:
coverage/
├── lcov-report/index.html    # HTML coverage report
├── lcov.info                 # LCOV format for CI/CD
└── coverage-summary.json     # JSON summary for tooling
```

---

## 9. Common Patterns & Conventions

### 9.1 Coding Style Guidelines

#### TypeScript Conventions
```typescript
// Interfaces use PascalCase
interface UserProfile {
  userName: string
  totalContributions: bigint
}

// Types use PascalCase
type TransactionStatus = 'idle' | 'pending' | 'success' | 'error'

// Enums use PascalCase
enum ModalType {
  GIVE_KINDNESS = 'give_kindness',
  RECEIVE_KINDNESS = 'receive_kindness'
}

// Function parameters and variables use camelCase
const calculateRemainingLimit = (dailyContributions: bigint, maxLimit: bigint): bigint => {
  return maxLimit - dailyContributions
}
```

#### React Component Patterns
```typescript
// Component interface definition
interface GiveKindnessModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (amount: string) => void
}

// Component with proper typing
export default function GiveKindnessModal({ isOpen, onClose, onSuccess }: GiveKindnessModalProps) {
  // Local state first
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Hooks second (grouped by purpose)
  const { address, isConnected } = useAccount()
  const constants = useContractConstants()
  
  // Contract interactions third
  const { writeContract, isPending } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: transactionHash
  })
  
  // Event handlers fourth
  const handleSubmit = useCallback(async () => {
    // Implementation
  }, [writeContract, amount])
  
  // Effects last
  useEffect(() => {
    if (isSuccess) {
      onSuccess?.(amount)
    }
  }, [isSuccess, amount, onSuccess])
  
  // Early returns for loading/error states
  if (!isConnected) {
    return <div>Please connect your wallet</div>
  }
  
  // Main render
  return (
    <div className="modal">
      {/* Component JSX */}
    </div>
  )
}
```

### 9.2 Design Patterns

#### Custom Hook Pattern
```typescript
// Consistent hook structure
export function useContractOperation() {
  // State management
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // External dependencies
  const { writeContract } = useWriteContract()
  
  // Main operation function
  const executeOperation = useCallback(async (params: OperationParams) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Implementation
      const result = await writeContract(params)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [writeContract])
  
  // Return object with consistent naming
  return {
    executeOperation,
    isLoading,
    error,
    reset: () => {
      setError(null)
      setIsLoading(false)
    }
  }
}
```

#### Error Boundary Pattern
```typescript
// Consistent error handling
const handleError = (error: Error, context: string) => {
  // Log technical details
  console.error(`Error in ${context}:`, error)
  
  // Parse user-friendly message
  let userMessage = 'An unexpected error occurred'
  
  if (error.message.includes('user rejected')) {
    userMessage = 'Transaction cancelled by user'
  } else if (error.message.includes('insufficient funds')) {
    userMessage = 'Insufficient ETH balance'
  } else if (error.message.includes('network')) {
    userMessage = 'Network connection issue. Please try again.'
  }
  
  // Show user notification
  showToast(userMessage, 'error')
  
  // Return structured error
  return {
    code: error.code || 'UNKNOWN_ERROR',
    message: userMessage,
    technical: error.message
  }
}
```

#### Context Provider Pattern
```typescript
// Provider with proper TypeScript
interface AppContextType {
  user: UserState | null
  updateUser: (updates: Partial<UserState>) => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserState | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const updateUser = useCallback((updates: Partial<UserState>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])
  
  const value = useMemo(() => ({
    user,
    updateUser,
    isLoading
  }), [user, updateUser, isLoading])
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook for context consumption
export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
```

### 9.3 File and Variable Naming

#### File Naming Conventions
```
# Components
src/components/client/GiveKindnessModal/
├── index.tsx                 # Main component
├── __tests__/index.test.tsx  # Component tests
└── types.ts                  # Component-specific types

# Hooks
src/hooks/
├── useContractConstants.ts   # Business logic hook
├── useFarcasterContext.ts    # External service hook
└── __tests__/               # Hook tests

# Utilities
src/utils/
├── config.ts                # Configuration constants
├── formatters.ts            # Data formatting utilities
└── validators.ts            # Input validation functions
```

#### Variable Naming Patterns
```typescript
// Boolean variables - use is/has/can prefixes
const isConnected = useAccount().isConnected
const hasName = !!userName
const canWithdraw = withdrawableAmount > 0n

// Event handlers - use handle prefix
const handleSubmit = () => {}
const handleClose = () => {}
const handleAmountChange = (value: string) => {}

// State setters - use set prefix
const [amount, setAmount] = useState('')
const [isLoading, setIsLoading] = useState(false)

// Constants - use UPPER_SNAKE_CASE
const MAX_CONTRIBUTION_AMOUNT = 5
const DEFAULT_COOLDOWN_HOURS = 1

// Contract addresses - use ADDRESS suffix
const KINDNESS_POOL_ADDRESS = '0x...'
const USER_REGISTRY_ADDRESS = '0x...'
```

### 9.4 Component Organization

#### Import Organization
```typescript
// External library imports first
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { formatEther, parseEther } from 'viem'

// Internal imports second, grouped by category
import { KINDNESS_POOL_ADDRESS, KINDNESS_POOL_ABI } from '@/contracts/kindness-pool'
import { useContractConstants } from '@/hooks/useContractConstants'
import { validateAmount } from '@/utils/validators'

// Component imports last
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
```

#### CSS Class Organization
```typescript
// Use consistent Tailwind patterns
const buttonClasses = cn(
  // Base styles
  'btn',
  // Size and padding
  'btn-lg px-12 py-6',
  // Colors and states
  'btn-primary hover:scale-105',
  // Transitions and animations
  'transition-transform duration-200',
  // Conditional styles
  isPending && 'loading'
)
```

---

## 10. Troubleshooting Guide

### 10.1 Common Development Issues

#### Wallet Connection Problems
```typescript
// Issue: Wallet not connecting
// Symptoms: Connect button doesn't respond, no wallet popup

// Check 1: Wallet extension installed
if (typeof window.ethereum === 'undefined') {
  console.error('No Ethereum wallet detected. Please install MetaMask or similar.')
}

// Check 2: Multiple wallet conflict
if (window.ethereum.providers && window.ethereum.providers.length > 1) {
  console.warn('Multiple wallet providers detected. Disable conflicting extensions.')
}

// Check 3: Network configuration
const config = createConfig({
  chains: [localhost, mainnet, base],
  connectors: [injected()],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'), // Ensure correct RPC URL
  },
})
```

#### Hydration Mismatch Errors
```typescript
// Issue: "Hydration failed because the server rendered HTML didn't match the client"
// Cause: Server/client state mismatch in wallet or user data

// Solution: Client-side rendering guard
const [isClient, setIsClient] = useState(false)

useEffect(() => {
  setIsClient(true)
}, [])

if (!isClient) {
  return <LoadingSpinner /> // Consistent loading state
}

// Ensure all conditional rendering is client-side only
{isConnected && hasName && isClient && (
  <WelcomeMessage userName={userName} />
)}
```

#### Contract Interaction Failures
```typescript
// Issue: Contract calls fail or return undefined
// Debug steps:

// 1. Check contract address and ABI
console.log('Contract Address:', KINDNESS_POOL_ADDRESS)
console.log('Function exists:', KINDNESS_POOL_ABI.find(f => f.name === 'giveKindness'))

// 2. Verify network connection
const { chain } = useAccount()
console.log('Current chain:', chain?.name)

// 3. Check development mode
if (DEVELOPMENT_MODE) {
  console.log('Development mode - using mock data')
  // Ensure mock implementation exists
}

// 4. Handle loading states
const { data, isLoading, error } = useReadContract({
  address: KINDNESS_POOL_ADDRESS,
  abi: KINDNESS_POOL_ABI,
  functionName: 'getDailyPool'
})

if (isLoading) return <Spinner />
if (error) return <ErrorMessage error={error} />
if (!data) return <NoDataMessage />
```

### 10.2 Build and Deployment Issues

#### TypeScript Compilation Errors
```bash
# Issue: Type errors preventing build
# Common fixes:

# 1. Check import paths
# Ensure all @/ imports resolve correctly
"baseUrl": ".",
"paths": {
  "@/*": ["./src/*"]
}

# 2. Verify Wagmi types
# Update to latest version if hooks have type issues
yarn add wagmi@latest viem@latest

# 3. Check strict mode settings
"strict": true,
"noImplicitAny": true,
"strictNullChecks": true
```

#### Next.js Build Failures
```bash
# Issue: Build fails with module resolution errors

# Check 1: Clear Next.js cache
rm -rf .next
yarn build

# Check 2: Verify dependencies
yarn install --check-files

# Check 3: Environment variables
# Ensure all required NEXT_PUBLIC_ variables are set
echo $NEXT_PUBLIC_APP_URL
```

#### Farcaster Frame Issues
```bash
# Issue: Frame not loading in Farcaster client

# Check 1: Verify frame metadata
curl -I https://your-domain.com/
# Should include proper Open Graph tags

# Check 2: Test with Frame Validator
# Visit: https://warpcast.com/~/developers/frames

# Check 3: Webhook endpoint
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "frame_added", "data": {"fid": 123}}'
```

### 10.3 Performance Issues

#### Slow Data Loading
```typescript
// Issue: Contract data loads slowly or frequently
// Solutions:

// 1. Optimize query intervals
const { data } = useReadContract({
  // Reduce frequency for less critical data
  query: { refetchInterval: 30000 } // 30 seconds instead of 5
})

// 2. Use React Query caching effectively
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

// 3. Batch contract calls
const { data: batchData } = useReadContracts({
  contracts: [
    {
      address: KINDNESS_POOL_ADDRESS,
      abi: KINDNESS_POOL_ABI,
      functionName: 'getDailyPool'
    },
    {
      address: KINDNESS_POOL_ADDRESS,
      abi: KINDNESS_POOL_ABI,
      functionName: 'getReceiverCount'
    }
  ]
})
```

#### Bundle Size Issues
```typescript
// Issue: Large JavaScript bundle size
// Solutions:

// 1. Lazy load components
const GiveKindnessModal = lazy(() => import('./GiveKindnessModal'))

// 2. Dynamic imports for heavy dependencies
const { formatEther } = await import('viem')

// 3. Tree shake unused utilities
// Only import what you need
import { formatEther } from 'viem/utils'
// Instead of: import { formatEther } from 'viem'
```

### 10.4 Debugging Tools and Techniques

#### Browser Developer Tools
```typescript
// React Developer Tools
// Install: React Developer Tools browser extension
// Usage: Components tab → find component → view props/state

// React Query Developer Tools
// Already included in development
const queryClient = new QueryClient()
// Visible at bottom of page in development

// Wagmi Developer Tools
// View wallet connection state and contract calls
// Console logs all contract interactions in development
```

#### Logging and Monitoring
```typescript
// Development logging
const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEBUG] ${message}`, data)
  }
}

// Error tracking pattern
const trackError = (error: Error, context: string) => {
  // Development: Console log
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR] ${context}:`, error)
  }
  
  // Production: Send to monitoring service
  if (process.env.NODE_ENV === 'production') {
    // analytics.track('error', { context, error: error.message })
  }
}

// Transaction debugging
const { writeContract } = useWriteContract({
  mutation: {
    onMutate: (variables) => {
      debugLog('Transaction initiated', variables)
    },
    onError: (error) => {
      trackError(error, 'contract_write')
    },
    onSuccess: (data) => {
      debugLog('Transaction successful', data)
    }
  }
})
```

#### Network Debugging
```bash
# Check local blockchain connection
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verify contract deployment
# Should return contract bytecode, not "0x"
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512","latest"],"id":1}'
```

---

## 11. Future Considerations

### 11.1 Technical Debt

#### Current Known Issues
```typescript
// 1. Browser Extension Conflicts
// Status: Mitigated with error filtering
// Future: Implement wallet provider selection UI
// Priority: Medium

// 2. Development Mode Mock Data
// Status: Works for development
// Future: Migrate to local test blockchain
// Priority: Low

// 3. Bundle Size Optimization
// Status: Acceptable for current scale
// Future: Code splitting and lazy loading
// Priority: Medium
```

#### Refactoring Opportunities
```typescript
// 1. Contract ABI Management
// Current: Hardcoded ABIs in single file
// Future: Generate types from contract artifacts
// Benefits: Type safety, automatic updates

// 2. Error Handling Standardization
// Current: Inconsistent error handling patterns
// Future: Centralized error handling service
// Benefits: Consistent UX, better monitoring

// 3. Component Composition
// Current: Some large components with multiple concerns
// Future: Split into smaller, focused components
// Benefits: Better testing, reusability
```

### 11.2 Planned Features

#### Phase 2 Enhancements
```typescript
// 1. Advanced Pool Analytics
interface PoolAnalytics {
  dailyTrends: DailyPoolData[]
  topContributors: UserContribution[]
  distributionHistory: Distribution[]
  averagePoolSize: number
}

// 2. User Achievement System
interface UserAchievements {
  streak: number              // Consecutive days of kindness
  totalImpact: bigint        // Lifetime contribution impact
  badges: Badge[]            // Earned achievement badges
  level: number              // User kindness level
}

// 3. Social Features
interface SocialFeatures {
  publicProfile: boolean     // Opt-in public statistics
  friendsList: string[]      // Connect with other users
  groupPools: GroupPool[]    // Private group pools
  challenges: Challenge[]    // Community challenges
}
```

#### Mobile Application
```typescript
// React Native implementation considerations
// 1. Wallet integration via WalletConnect
// 2. Push notifications for distributions
// 3. Simplified UI for mobile frames
// 4. Offline state management

interface MobileFeatures {
  pushNotifications: {
    dailyReminders: boolean
    distributionAlerts: boolean
    poolMilestones: boolean
  }
  biometricAuth: boolean
  quickActions: {
    quickGive: string[]        // Preset amounts
    oneClickReceive: boolean
  }
}
```

### 11.3 Scalability Considerations

#### Database and Caching Strategy
```typescript
// Current: React Query for client-side caching
// Future: Redis for server-side caching + CDN

interface CachingStrategy {
  // Real-time data (no caching)
  livePoolStatus: 'no-cache'
  userBalances: 'no-cache'
  
  // Frequent updates (short cache)
  poolStatistics: '30-seconds'
  userStatistics: '1-minute'
  
  // Static data (long cache)
  contractConstants: '1-hour'
  userProfiles: '5-minutes'
  historicalData: '1-day'
}

// Future: Database for historical analytics
interface AnalyticsDB {
  dailyPoolSnapshots: DailySnapshot[]
  userActivityLogs: ActivityLog[]
  distributionEvents: DistributionEvent[]
  systemMetrics: SystemMetric[]
}
```

#### Performance Optimizations
```typescript
// 1. Contract Call Optimization
// Current: Individual useReadContract calls
// Future: Multicall for batch operations

// 2. Real-time Updates
// Current: Polling with refetchInterval
// Future: WebSocket subscriptions for live data

// 3. Image and Asset Optimization
// Current: Static images in public folder
// Future: CDN with automatic optimization

interface PerformanceTargets {
  initialPageLoad: '<2 seconds'
  transactionConfirmation: '<30 seconds'
  realTimeUpdates: '<5 seconds'
  imageCacheHit: '>90%'
}
```

### 11.4 Security Enhancements

#### Smart Contract Upgrades
```solidity
// Future: Implement upgradeable proxy pattern
// Benefits: Bug fixes, feature additions without migration
// Considerations: Governance mechanism for upgrades

contract KindnessPoolV2 {
    // Enhanced features
    mapping(address => uint256) public reputationScores;
    uint256 public maxPoolSize;
    bool public emergencyPause;
    
    // Governance
    address public governor;
    uint256 public proposalThreshold;
}
```

#### Security Monitoring
```typescript
// 1. Transaction Monitoring
interface SecurityMonitoring {
  suspiciousPatterns: {
    rapidTransactions: boolean
    unusualAmounts: boolean
    newAccountActivity: boolean
  }
  
  rateLimit: {
    transactionsPerHour: number
    contributionsPerDay: number
    withdrawalsPerDay: number
  }
  
  emergencyPause: {
    triggerConditions: string[]
    pauseDuration: number
    recoveryProcedure: string[]
  }
}

// 2. User Protection
interface UserProtection {
  maxDailyRisk: bigint        // Limit exposure per user
  coolingOffPeriod: number    // Mandatory wait between large actions
  socialRecovery: boolean     // Account recovery via friends
}
```

### 11.5 Community and Governance

#### DAO Integration
```typescript
// Future: Decentralized governance for protocol parameters
interface DAOGovernance {
  proposals: {
    changePoolLimits: ProposalType
    adjustCooldowns: ProposalType
    addNewFeatures: ProposalType
    emergencyActions: ProposalType
  }
  
  voting: {
    eligibility: 'reputation-based' | 'token-based'
    quorum: number
    duration: number
  }
  
  execution: {
    timelock: number            // Delay before execution
    vetoRights: string[]        // Who can veto
    emergencyOverride: boolean
  }
}
```

#### Community Features
```typescript
// Enhanced community engagement
interface CommunityFeatures {
  leaderboards: {
    topGivers: UserRanking[]
    kindnessStreaks: UserRanking[]
    communityImpact: CommunityStats
  }
  
  events: {
    charityChallenges: Challenge[]
    seasonalCampaigns: Campaign[]
    communityGoals: Goal[]
  }
  
  recognition: {
    publicShoutouts: Shoutout[]
    impactStories: Story[]
    thankyouMessages: Message[]
  }
}
```

This comprehensive developer onboarding guide provides a complete understanding of the Random Act of Kindness project architecture, codebase organization, and development workflow. New developers can use this guide to quickly understand the project's purpose, set up their development environment, navigate the codebase effectively, and contribute meaningfully to the project.

The guide will be maintained and updated as the project evolves, ensuring it remains an accurate and valuable resource for the development team.