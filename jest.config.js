module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@scure|@noble)/)',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    'node_modules/(@scure|@noble)/.+\\.m?js$': 'ts-jest',
  },
}
