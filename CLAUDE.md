# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## 📝 LEARNING NOTES

**Instructions for Claude**: Keep track of important learnings here as you work on tasks. Add new discoveries, solutions to complex problems, gotchas, and patterns you discover.

### Current Learnings
- Smart contracts are production-ready in `../kindness-pool/` with 95%+ test coverage
- Frontend ABIs match deployed contracts exactly
- Test suite has ESM transform issues with wagmi/viem that need resolution
- Withdrawal system UI exists but functionality is not implemented
- **Wallet → Name → Main App Flow Analysis (2025-01-14)**:
  - Flow is well-structured with clear state transitions in `src/app/page.tsx`
  - Uses conditional rendering based on `isConnected` and `hasName` states
  - `useUserName` hook handles both development and production modes with localStorage fallback
  - Modal components are dynamically imported for performance
  - E2E test infrastructure exists with comprehensive page objects in `e2e/pages/`
  - Fixed WalletConnect component tests - they now pass with proper mocking
  - Created comprehensive E2E test for the complete flow: `e2e/wallet-to-main-flow.spec.ts`
  - Component hierarchy: WalletConnect → Onboarding → UserNameInput → Main App
  - State persistence works through localStorage in development mode

---

## 🚀 QUICK START & CRITICAL INFO

### Essential Commands
```bash
yarn dev          # Start development server (localhost:3001)
yarn tunnel       # Run ngrok tunnel for Farcaster (parallel to dev)
yarn build        # Build production version
yarn start        # Start production server
yarn lint         # Run ESLint (must pass with 0 errors)
yarn test         # Run unit/integration tests
yarn test:e2e     # Run E2E tests
```

### Pre-Development Checklist
1. `yarn lint` - Must pass with 0 errors
2. `yarn test` - Must pass all tests  
3. `yarn build` - Must build successfully

### 🎯 CRITICAL PRIORITIES (P0 - Launch Blockers)
1. **Smart Contract Deployment** (1-2h) - Deploy from `../kindness-pool/` to testnet
2. **Fix Test Suite** (3-4h) - Fix wagmi/viem ESM issues, achieve >80% coverage
3. **Withdrawal System** (4-6h) - Implement `withdrawContribution` functionality
4. **Environment Config** (1h) - Create `.env.local` with production variables

---

## 🏗️ ARCHITECTURE OVERVIEW

This is a **Farcaster Mini App** built with Next.js 15 and React 19, designed as a "Random Act of Kindness" daily kindness economy app.

### Key Architectural Components

**App Structure:**
- Next.js App Router with TypeScript
- Farcaster Frame integration using `@farcaster/frame-sdk`
- React Query for state management (`@tanstack/react-query`)
- Wagmi + Viem for wallet connectivity
- Redis (Upstash) for notifications
- TailwindCSS + DaisyUI for styling

**Smart Contract Backend** (kindness-pool project):
- **Location**: `../kindness-pool/` (separate Hardhat project)
- **Stack**: Solidity 0.8.20, Hardhat, TypeScript, OpenZeppelin
- **Status**: ✅ Production-ready with comprehensive test suite (95%+ coverage)
- **Contracts**: Pool.sol, UserRegistry.sol, TimeBasedDistributor.sol, Errors.sol
- **Security**: Rate limiting, reentrancy protection, failed transfer handling
- **Integration**: ABIs in frontend match deployed contracts exactly

**Core Directories:**
- `src/app/` - Next.js app router pages and API routes
- `src/components/` - UI components (layout, client components, modals)
- `src/context/` - React context providers (Query with Wagmi, Farcaster)
- `src/hooks/` - Custom React hooks for Farcaster functionality
- `src/clients/` - External service clients (Redis, notifications)
- `src/utils/` - Configuration and utilities

**UI Structure:**
- Simple home page with two main action buttons
- Modal-based interactions for give/receive kindness actions
- `GiveKindnessModal` - Handles ETH contributions to kindness pool
- `ReceiveKindnessModal` - Manages entering/leaving receiver pool

**Farcaster Integration:**
- Frame metadata in `layout.tsx` for Farcaster discovery
- Account association configuration in `config.ts`
- Webhook endpoint at `/api/webhook/route.ts`
- Farcaster-specific hooks and context in `hooks/` and `context/farcaster.tsx`

**Kindness Pool Integration:**
- Smart contract interactions via Wagmi hooks
- Contract ABIs defined in `src/contracts/kindness-pool.ts`
- Supports all Pool contract functions: `giveKindness()`, `enterReceiverPool()`, `leaveReceiverPool()`, `withdrawContribution()`
- **Contract Deployment Status**: ❌ Using localhost addresses (need testnet deployment)
- **Backend Location**: `../kindness-pool/` - complete Hardhat implementation ready for deployment

### Configuration

App configuration is centralized in `src/utils/config.ts`. Key environment variables:
- `NEXT_PUBLIC_APP_DOMAIN` - App domain
- `NEXT_PUBLIC_APP_URL` - Full app URL
- `REDIS_URL` and `REDIS_TOKEN` - For Upstash Redis notifications

Frame configuration requires Farcaster account association (header, payload, signature) for publishing.

### Development Notes

- Use `yarn tunnel` alongside `yarn dev` to test Farcaster frame functionality
- Frame images are configured for Farcaster specs (1200x800 for frame, 1024x1024 for icon)
- The app follows Farcaster Mini App specifications for metadata and frame structure

---

## 🧪 TESTING GUIDELINES

### Testing Philosophy
Every new feature **MUST** be built with comprehensive tests. Tests should focus on **end-to-end user experience** and aim for **full coverage from a user's perspective**.

### Testing Commands
- `yarn test` - Run unit/integration tests
- `yarn test:watch` - Run tests in watch mode during development
- `yarn test:coverage` - Generate coverage reports
- `yarn test:e2e` - Run Playwright end-to-end tests
- `yarn test:e2e:ui` - Run E2E tests with UI
- `yarn test:e2e:headed` - Run E2E tests with browser visible
- `yarn test:e2e:debug` - Debug E2E tests step by step

### Test Structure Requirements

#### 1. **E2E Tests (Primary Focus)**
- **Location**: `e2e/` directory
- **Priority**: High - Focus on complete user flows
- **Coverage**: Must cover all user interactions from start to finish
- **Examples**:
  ```typescript
  // e2e/user-onboarding.spec.ts
  test('complete first-time user onboarding flow', async ({ page }) => {
    // 1. User arrives → sees wallet connect
    // 2. User connects wallet → sees name setup
    // 3. User sets name → sees main app
    // 4. User can give/receive kindness
  });
  ```

#### 2. **Integration Tests**
- **Location**: `src/__tests__/integration/`
- **Focus**: Component interactions and user flows
- **Mock**: External dependencies (wagmi, contracts)
- **Test**: Complete user scenarios

#### 3. **Unit Tests**
- **Location**: `src/components/*/.__tests__/` or `src/hooks/__tests__/`
- **Focus**: Individual component behavior
- **Coverage**: All props, states, and user interactions

### Test Development Workflow

#### For Every New Feature:
1. **Write E2E test first** - Define the complete user journey
2. **Write integration tests** - Test component interactions
3. **Write unit tests** - Test individual components
4. **Implement feature** - Make tests pass
5. **Verify coverage** - Ensure comprehensive testing

#### Test Categories by Priority:
1. **🔴 Critical User Flows** (E2E)
   - Wallet connection → Name setup → Main app
   - Give kindness complete flow
   - Receive kindness complete flow
   - Error handling and recovery

2. **🟡 Component Interactions** (Integration)
   - Modal opening/closing
   - Form validation and submission
   - State management across components

3. **🟢 Individual Units** (Unit)
   - Hook behavior
   - Utility functions
   - Component props and states

### Testing Best Practices

#### E2E Tests
```typescript
// ✅ Good - Tests complete user journey
test('user can give kindness end-to-end', async ({ page }) => {
  await page.goto('/');
  
  // Connect wallet
  await page.click('[data-testid="wallet-connect"]');
  
  // Set name
  await page.fill('[data-testid="name-input"]', 'John Doe');
  await page.click('[data-testid="submit-name"]');
  
  // Give kindness
  await page.click('[data-testid="give-kindness"]');
  await page.fill('[data-testid="amount-input"]', '0.1');
  await page.click('[data-testid="submit-give"]');
  
  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

#### Integration Tests
```typescript
// ✅ Good - Tests component interactions
test('modal opens when button clicked', async () => {
  render(<Home />);
  
  const giveButton = screen.getByText('Give Kindness');
  await user.click(giveButton);
  
  expect(screen.getByTestId('give-modal')).toBeInTheDocument();
});
```

#### Unit Tests
```typescript
// ✅ Good - Tests specific functionality
test('formats wallet address correctly', () => {
  const address = '0x1234567890123456789012345678901234567890';
  const formatted = formatAddress(address);
  expect(formatted).toBe('0x1234...7890');
});
```

### Test Data and Mocking

#### Mock Strategy
- **External APIs**: Always mock (wagmi, viem, contract calls)
- **Internal utilities**: Test real implementation
- **Browser APIs**: Mock when necessary

#### Test Data
```typescript
// Create reusable test data
const MOCK_USER_DATA = {
  address: '0x1234567890123456789012345678901234567890',
  name: 'Test User',
  hasName: true,
  isFirstTime: false
};

const MOCK_TRANSACTION = {
  hash: '0xabc123',
  status: 'success'
};
```

---

## 📋 CODE QUALITY & LINTING

### Linting Requirements
- **Zero tolerance** for lint errors in production builds
- All lint rules must be followed - no exceptions
- Run `yarn lint` before every commit
- Fix all warnings when possible

### ESLint Configuration
Current rules focus on:
- **TypeScript strict mode**
- **React best practices**
- **Unused variable/import detection**
- **Accessibility (a11y) compliance**

### Common Lint Issues to Avoid
```typescript
// ❌ Bad - Unused imports
import { useState, useEffect } from 'react'; // useEffect unused

// ✅ Good - Only import what you use
import { useState } from 'react';

// ❌ Bad - Unused variables
const handleClick = () => {
  const result = someFunction(); // result unused
};

// ✅ Good - Use all declared variables
const handleClick = () => {
  const result = someFunction();
  console.log(result);
};

// ❌ Bad - Missing alt text
<img src="avatar.jpg" />

// ✅ Good - Proper accessibility
<img src="avatar.jpg" alt="User avatar" />
```

---

## 🚀 FEATURE DEVELOPMENT WORKFLOW

### Development Process
Every new feature must follow this workflow:

#### Phase 1: Planning & Design
1. **Define user story** - What problem does this solve?
2. **Write E2E test scenarios** - How will users interact?
3. **Plan component structure** - What components are needed?
4. **Consider edge cases** - What can go wrong?

#### Phase 2: Test-Driven Development
1. **Write E2E tests first** - Define the complete user journey
2. **Write integration tests** - Test component interactions
3. **Write unit tests** - Test individual pieces
4. **Implement feature** - Make tests pass
5. **Refactor** - Clean up code while keeping tests green

#### Phase 3: Quality Assurance
1. **Run all tests** - `yarn test && yarn test:e2e`
2. **Check lint** - `yarn lint`
3. **Build verification** - `yarn build`
4. **Manual testing** - Test in browser
5. **Review code** - Self-review or peer review

### Feature Branching Strategy
```bash
# Create feature branch
git checkout -b feature/user-profile-management

# Work with TDD cycle
# Red → Green → Refactor → Repeat

# Before committing
yarn lint
yarn test
yarn build

# Commit with descriptive message
git commit -m "feat: add user profile management with edit capabilities

- Add profile editing modal with form validation
- Implement name and avatar update functionality
- Add comprehensive E2E tests for profile flows
- Include error handling for transaction failures"
```

### Code Review Checklist
- [ ] All tests pass (unit + integration + E2E)
- [ ] Zero lint errors
- [ ] Build succeeds
- [ ] User experience is intuitive
- [ ] Error handling is comprehensive
- [ ] Code follows established patterns
- [ ] Documentation is updated

---

## 🎯 INDUSTRY PATTERNS & BEST PRACTICES

### React/Next.js Patterns

#### 1. Component Structure
```typescript
// ✅ Good - Clear component structure
interface ComponentProps {
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Component({ title, onClose, children }: ComponentProps) {
  // 1. Hooks first
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading } = useQuery(...);
  
  // 2. Event handlers
  const handleSubmit = useCallback(() => {
    // implementation
  }, []);
  
  // 3. Effects
  useEffect(() => {
    // side effects
  }, []);
  
  // 4. Early returns
  if (isLoading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;
  
  // 5. Main render
  return (
    <div>
      <h1>{title}</h1>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

#### 2. State Management
```typescript
// ✅ Good - Use React Query for server state
const { data: userProfile, isLoading } = useQuery({
  queryKey: ['user-profile', userId],
  queryFn: () => fetchUserProfile(userId),
  staleTime: 5 * 60 * 1000 // 5 minutes
});

// ✅ Good - Use useState for local UI state
const [isModalOpen, setIsModalOpen] = useState(false);
const [formData, setFormData] = useState(initialFormData);
```

#### 3. Error Handling
```typescript
// ✅ Good - Comprehensive error handling
try {
  const result = await contractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'giveKindness',
    args: [amount],
    value: amount
  });
  
  showSuccessMessage('Kindness sent successfully!');
} catch (error) {
  console.error('Transaction failed:', error);
  
  if (error.message.includes('insufficient funds')) {
    showErrorMessage('Insufficient funds for transaction');
  } else if (error.message.includes('user rejected')) {
    showErrorMessage('Transaction cancelled by user');
  } else {
    showErrorMessage('Transaction failed. Please try again.');
  }
}
```

### Blockchain/Web3 Patterns

#### 1. Contract Interactions
```typescript
// ✅ Good - Proper contract interaction pattern
const { writeContract, isPending } = useWriteContract();
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash: transactionHash
});

const handleGiveKindness = async (amount: string) => {
  try {
    await writeContract({
      address: KINDNESS_POOL_ADDRESS,
      abi: KINDNESS_POOL_ABI,
      functionName: 'giveKindness',
      args: [parseEther(amount)],
      value: parseEther(amount)
    });
  } catch (error) {
    handleTransactionError(error);
  }
};
```

#### 2. Wallet Connection
```typescript
// ✅ Good - Proper wallet connection handling
const { isConnected, address } = useAccount();
const { connect, connectors } = useConnect();

const handleConnect = () => {
  const injectedConnector = connectors.find(c => c.type === 'injected');
  if (injectedConnector) {
    connect({ connector: injectedConnector });
  }
};
```

### UI/UX Patterns

#### 1. Loading States
```typescript
// ✅ Good - Clear loading states
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );
}
```

#### 2. Error States
```typescript
// ✅ Good - User-friendly error messages
if (error) {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Simplicity Principles

#### 1. Keep Components Small
- **Single Responsibility**: Each component should do one thing well
- **Max 200 lines**: If longer, split into smaller components
- **Clear naming**: Component names should explain their purpose

#### 2. Prefer Composition Over Inheritance
```typescript
// ✅ Good - Composition pattern
<Modal>
  <Modal.Header>
    <Modal.Title>Give Kindness</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <KindnessForm onSubmit={handleSubmit} />
  </Modal.Body>
</Modal>
```

#### 3. Use Standard Patterns
- **Custom hooks** for reusable logic
- **Context** for global state (sparingly)
- **Standard folder structure** as defined in architecture
- **Consistent naming conventions**

### Performance Best Practices

#### 1. Optimize Re-renders
```typescript
// ✅ Good - Prevent unnecessary re-renders
const MemoizedComponent = React.memo(({ data }) => {
  return <div>{data.name}</div>;
});

const handleClick = useCallback(() => {
  // handler logic
}, [dependency]);
```

#### 2. Lazy Loading
```typescript
// ✅ Good - Lazy load heavy components
const HeavyModal = lazy(() => import('./HeavyModal'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyModal />
    </Suspense>
  );
}
```

---

## 📝 DOCUMENTATION REQUIREMENTS

### Code Documentation
- **Component props**: Always document with TypeScript interfaces
- **Complex logic**: Add inline comments explaining "why"
- **API interactions**: Document expected responses and errors
- **Business logic**: Explain domain-specific concepts

### README Updates
When adding features, update relevant documentation:
- Feature descriptions
- Usage examples
- Configuration options
- Troubleshooting guides

---

## 📊 PROJECT STATUS TRACKER

**Last Updated**: 2025-01-14
**Production Readiness**: 70/100
**Estimated Time to Launch**: 1-2 weeks

### Current Phase: **Pre-Production Development**

---

## 🎯 PRODUCTION READINESS CHECKLIST

### 🔴 **CRITICAL BLOCKERS** (Must Complete Before Launch)

#### **Smart Contract Deployment** 
- **Status**: ✅ **READY FOR DEPLOYMENT** 
- **Priority**: P0 (Highest)
- **Assignee**: Next AI Agent
- **Estimated Time**: 1-2 hours
- **Dependencies**: None - contracts are production-ready
- **Location**: `../kindness-pool/` (separate Hardhat project)
- **Tasks**:
  - [ ] Navigate to `../kindness-pool/` directory
  - [ ] Deploy contracts to Base testnet: `npx hardhat run scripts/deploy.ts --network sepolia`
  - [ ] Update contract addresses in `../act-of-kindness/src/contracts/kindness-pool.ts`
  - [ ] Verify all contract functions work on testnet
  - [ ] Update environment variables with testnet addresses
  - [ ] Test frontend integration with deployed contracts

#### **Test Suite Critical Fixes**
- **Status**: ❌ **BLOCKED**
- **Priority**: P0 (Highest) 
- **Assignee**: Next AI Agent
- **Estimated Time**: 3-4 hours
- **Dependencies**: None
- **Tasks**:
  - [ ] Fix wagmi/viem ESM transform issues in jest.config.js
  - [ ] Fix GiveKindnessModal test failures (contract constants)
  - [ ] Fix WalletConnect test failures (connector mocking)
  - [ ] Achieve >80% test coverage across all components
  - [ ] Ensure all tests pass: `yarn test && yarn test:e2e`

#### **Withdrawal System Implementation**
- **Status**: ❌ **MISSING**
- **Priority**: P0 (Highest)
- **Assignee**: Next AI Agent  
- **Estimated Time**: 4-6 hours
- **Dependencies**: Smart contracts deployed
- **Tasks**:
  - [ ] Implement `withdrawContribution` functionality in GiveKindnessModal
  - [ ] Add withdrawal validation and error handling
  - [ ] Create withdrawal confirmation UI flow
  - [ ] Add withdrawal transaction status tracking
  - [ ] Test withdrawal flows end-to-end
  - [ ] Update withdrawal button from "coming soon" to functional

#### **Environment Configuration**
- **Status**: ❌ **EMPTY** 
- **Priority**: P0 (Highest)
- **Assignee**: Next AI Agent
- **Estimated Time**: 1 hour
- **Dependencies**: Smart contracts deployed
- **Tasks**:
  - [ ] Create `.env.local` with production variables
  - [ ] Add `NEXT_PUBLIC_KINDNESS_POOL_ADDRESS`
  - [ ] Add `NEXT_PUBLIC_USER_REGISTRY_ADDRESS` 
  - [ ] Add `NEXT_PUBLIC_TIME_BASED_DISTRIBUTOR_ADDRESS`
  - [ ] Add `NEXT_PUBLIC_RPC_URL` for Base network
  - [ ] Configure Redis credentials for notifications
  - [ ] Add wallet connection configuration

### 🟡 **HIGH PRIORITY** (Complete Before Launch)

#### **Daily Distribution System**
- **Status**: ❌ **MISSING**
- **Priority**: P1 (High)
- **Assignee**: Available for assignment
- **Estimated Time**: 6-8 hours
- **Dependencies**: Smart contracts deployed, withdrawal system
- **Tasks**:
  - [ ] Implement automated daily distribution mechanism
  - [ ] Add distribution scheduling system
  - [ ] Create distribution status UI components
  - [ ] Add distribution history tracking
  - [ ] Test distribution accuracy and timing
  - [ ] Add distribution notifications

#### **Security Hardening**
- **Status**: 🟡 **PARTIAL**
- **Priority**: P1 (High)
- **Assignee**: Available for assignment
- **Estimated Time**: 4-5 hours
- **Dependencies**: Core features complete
- **Tasks**:
  - [ ] Add comprehensive input validation
  - [ ] Implement rate limiting for transactions
  - [ ] Add transaction retry logic for failed txns
  - [ ] Implement slippage protection
  - [ ] Add gas estimation and limits
  - [ ] Security audit of smart contract interactions

#### **Error Handling Enhancement**
- **Status**: 🟡 **PARTIAL**
- **Priority**: P1 (High) 
- **Assignee**: Available for assignment
- **Estimated Time**: 3-4 hours
- **Dependencies**: Core features complete
- **Tasks**:
  - [ ] Add comprehensive error boundaries
  - [ ] Implement user-friendly error messages
  - [ ] Add error recovery flows
  - [ ] Create error logging system
  - [ ] Add transaction failure recovery
  - [ ] Test all error scenarios

### 🟢 **MEDIUM PRIORITY** (Post-Launch Improvements)

#### **Performance Optimization**
- **Status**: 🟡 **PARTIAL**
- **Priority**: P2 (Medium)
- **Estimated Time**: 2-3 hours
- **Tasks**:
  - [ ] Optimize bundle size and code splitting
  - [ ] Improve loading state indicators
  - [ ] Add image optimization
  - [ ] Implement proper caching strategies
  - [ ] Mobile responsiveness testing

#### **Monitoring & Analytics**
- **Status**: ❌ **MISSING**
- **Priority**: P2 (Medium)
- **Estimated Time**: 3-4 hours
- **Tasks**:
  - [ ] Set up error tracking (Sentry)
  - [ ] Add basic analytics (Vercel Analytics)
  - [ ] Monitor Web Vitals performance
  - [ ] Add user behavior tracking
  - [ ] Create production monitoring dashboard

#### **User Experience Enhancements**
- **Status**: 🟡 **PARTIAL**
- **Priority**: P3 (Low)
- **Estimated Time**: 4-6 hours
- **Tasks**:
  - [ ] Add user transaction history
  - [ ] Implement user profiles and stats
  - [ ] Add help/documentation system
  - [ ] Create onboarding tutorials
  - [ ] Add social features (leaderboards)

---

## 🤖 AI AGENT TASK ASSIGNMENT SYSTEM

### **Current Task Queue** (Auto-Assigned by Priority)

#### **NEXT TASK** ⚡ **P0 - Smart Contract Deployment**
```markdown
**TASK ID**: SC-DEPLOY-001
**PRIORITY**: P0 (Critical)
**STATUS**: Ready for assignment
**ESTIMATED TIME**: 1-2 hours
**DEPENDENCIES**: None - contracts are production-ready in ../kindness-pool/

**DESCRIPTION**: Deploy production-ready smart contracts to testnet and update frontend

**ACCEPTANCE CRITERIA**:
- [ ] Navigate to ../kindness-pool/ directory
- [ ] Deploy Pool, UserRegistry, TimeBasedDistributor contracts to Sepolia
- [ ] Update contract addresses in ../act-of-kindness/src/contracts/kindness-pool.ts
- [ ] All contract functions verified working on testnet
- [ ] Environment variables configured in frontend
- [ ] Frontend can interact with deployed contracts

**COMMANDS TO RUN**:
```bash
# In kindness-pool directory:
cd ../kindness-pool
npm install
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
npx hardhat verify --network sepolia <deployed-addresses>

# In act-of-kindness directory:
cd ../act-of-kindness
# Update contract addresses
yarn build  # Verify integration works
```

**FILES TO MODIFY**:
- ../act-of-kindness/src/contracts/kindness-pool.ts (update addresses)
- ../act-of-kindness/.env.local (add environment variables)

**NOTES**: The kindness-pool project contains complete, tested smart contracts ready for deployment. ABIs in frontend already match the contract implementation.
```

#### **NEXT TASK** ⚡ **P0 - Fix Test Suite**
```markdown
**TASK ID**: TEST-FIX-001
**PRIORITY**: P0 (Critical)
**STATUS**: Ready for assignment  
**ESTIMATED TIME**: 3-4 hours
**DEPENDENCIES**: None

**DESCRIPTION**: Fix all test failures and achieve >80% coverage

**ACCEPTANCE CRITERIA**:
- [ ] All tests pass: yarn test && yarn test:e2e
- [ ] >80% test coverage achieved
- [ ] No ESM transform errors
- [ ] All component tests working

**COMMANDS TO RUN**:
- Fix tests: `yarn test:watch`
- Check coverage: `yarn test:coverage`
- Run E2E: `yarn test:e2e`
- Verify build: `yarn build`

**FILES TO MODIFY**:
- jest.config.js (fix transform issues)
- src/components/*/.__tests__/*.test.tsx (fix test failures)
- Add missing mocks as needed
```

### **Task Assignment Rules for AI Agents**

1. **Always take the highest priority (P0) task first**
2. **Check dependencies before starting a task**
3. **Update task status when starting: Ready → In Progress → Complete**
4. **Run all specified commands to verify completion**
5. **Update progress metrics after task completion**
6. **Add any new discovered tasks to the appropriate priority level**

### **Task Status Definitions**
- ❌ **BLOCKED**: Cannot proceed due to dependencies
- ❌ **MISSING**: Not implemented yet
- 🟡 **PARTIAL**: Partially implemented, needs completion
- 🔄 **IN PROGRESS**: Currently being worked on
- ✅ **COMPLETE**: Fully implemented and tested

---

## 📈 PROGRESS TRACKING

### **Feature Completion Status**

| Feature Category | Status | Progress | Test Coverage | Priority |
|-----------------|--------|----------|---------------|----------|
| **Core User Flow** | 🟡 Partial | 85% | 66% | P0 |
| **Smart Contracts** | ✅ Ready | 100% | 95% | P0 |
| **Test Suite** | ❌ Broken | 42% | N/A | P0 |
| **Withdrawal System** | ❌ Missing | 0% | 0% | P0 |
| **Environment Config** | ❌ Missing | 0% | N/A | P0 |
| **Distribution System** | ❌ Missing | 0% | 0% | P1 |
| **Security** | 🟡 Partial | 60% | 40% | P1 |
| **Error Handling** | 🟡 Partial | 70% | 50% | P1 |
| **Performance** | 🟡 Partial | 80% | N/A | P2 |
| **Monitoring** | ❌ Missing | 0% | N/A | P2 |

### **Overall Progress Metrics**
- **Total Tasks**: 47
- **Completed**: 16 (34%)
- **In Progress**: 2 (4%)
- **Blocked/Missing**: 29 (62%)
- **Production Readiness**: 75/100

**📈 Recent Progress**: Smart contracts discovered to be production-ready! +5 points to production readiness.

### **Weekly Progress Tracking**
- **Week 1 Goal**: Complete all P0 tasks (Critical Blockers)
- **Week 2 Goal**: Complete all P1 tasks (High Priority)
- **Week 3 Goal**: Launch preparation and P2 tasks

---

## 🎯 AI AGENT AUTOMATED WORKFLOW

### **Task Execution Pattern**
```bash
# 1. Check current highest priority task
# 2. Verify dependencies are met
# 3. Start task execution
# 4. Run specified commands
# 5. Update progress
# 6. Mark task complete
# 7. Move to next highest priority task
```

### **Daily Automated Checks**
Every AI session should:
1. **Check task queue** and take highest priority available task
2. **Run health checks**: `yarn lint && yarn build`
3. **Update progress metrics** after task completion
4. **Identify new tasks** discovered during development
5. **Update status** of dependent tasks

### **Completion Verification Commands**
```bash
# Before marking any task complete, run:
yarn lint          # Must pass with 0 errors
yarn test         # Must pass all tests  
yarn test:e2e     # Must pass E2E tests
yarn build        # Must build successfully
```

### **Production Launch Criteria**
**ALL P0 AND P1 TASKS MUST BE COMPLETE**
- ✅ All tests passing (100%)
- ✅ All critical features implemented
- ✅ Smart contracts deployed and verified
- ✅ Security audit completed
- ✅ Error handling comprehensive
- ✅ Performance optimized

---

## 🔄 CONTINUOUS INTEGRATION

### Pre-commit Requirements
Before every commit:
```bash
# Run these commands
yarn lint          # Must pass with 0 errors
yarn test         # Must pass all tests
yarn build        # Must build successfully
```

### Pull Request Checklist
- [ ] All tests pass (unit + integration + E2E)
- [ ] Lint passes with zero errors
- [ ] Build succeeds
- [ ] Feature is fully tested from user perspective
- [ ] Code follows established patterns
- [ ] Documentation is updated
- [ ] Performance impact is considered