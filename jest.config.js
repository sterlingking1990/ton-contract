export default {
  preset: 'ts-jest/presets/default-esm', // Use the ESM preset
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      useESM: true, // Ensure ts-jest uses ESM
    },
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@ton-community|ton-core)/)', // Include necessary packages for transformation
  ],
  extensionsToTreatAsEsm: ['.ts'], // Treat .ts files as ESM
};
