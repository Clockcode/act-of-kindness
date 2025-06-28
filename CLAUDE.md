# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `yarn dev` - Start development server on localhost:3001
- `yarn tunnel` - Run ngrok tunnel for Farcaster preview (run parallel to dev)
- `yarn build` - Build production version
- `yarn start` - Start production server
- `yarn lint` - Run ESLint

## Architecture Overview

This is a **Farcaster Mini App** built with Next.js 15 and React 19, designed as a "Random Act of Kindness" daily kindness economy app.

### Key Architectural Components

**App Structure:**
- Next.js App Router with TypeScript
- Farcaster Frame integration using `@farcaster/frame-sdk`
- React Query for state management (`@tanstack/react-query`)
- Wagmi + Viem for wallet connectivity
- Redis (Upstash) for notifications
- TailwindCSS + DaisyUI for styling

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
- Contract ABI defined in modal components
- Supports `giveKindness(amount)` and `enterReceiverPool()` functions
- Contract address configurable in modal components (currently placeholder)

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