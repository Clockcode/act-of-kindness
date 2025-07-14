import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize bundle size
    optimizePackageImports: ['@tanstack/react-query', 'wagmi', 'viem'],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable modern JavaScript features
  transpilePackages: ['@farcaster/frame-sdk'],
};

export default nextConfig;
