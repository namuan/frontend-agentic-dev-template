module.exports = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {}],
    '^.+\\.js$': ['@swc/jest', { jsc: { parser: { syntax: 'ecmascript' } }, module: { type: 'commonjs' } }],
  },
  setupFiles: ['<rootDir>/tests/setupGlobals.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(module)\\.css$': 'identity-obj-proxy',
    '\\.(css)$': '<rootDir>/tests/styleMock.js',
  },
  testPathIgnorePatterns: ['<rootDir>/tests/e2e/'],
  transformIgnorePatterns: [
    '/node_modules/(?!(until-async|tough-cookie)/)/',
  ],
};
