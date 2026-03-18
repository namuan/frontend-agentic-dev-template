module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/tests/setupGlobals.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(module)\\.css$': 'identity-obj-proxy',
    '\\.(css)$': '<rootDir>/tests/styleMock.js',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
};
