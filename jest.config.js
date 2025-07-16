const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/?(*.)(test|spec).(ts|tsx|js)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^wagmi$': '<rootDir>/src/__mocks__/wagmi.ts',
    '^wagmi/connectors$': '<rootDir>/src/__mocks__/wagmi.ts',
    '^viem$': '<rootDir>/src/__mocks__/wagmi.ts',
    '^next/image$': '<rootDir>/src/__mocks__/next-image.tsx',
    '^next/link$': '<rootDir>/src/__mocks__/next-link.tsx',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(wagmi|viem|@wagmi|@tanstack|@coinbase)/)',
  ],
}

module.exports = createJestConfig(config)