// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/src/**/*.ts'
  ],


  // The test environment that will be used for testing
  testEnvironment: "node",

  testMatch: [
    "**/test/**/*.test.ts",
  ],

  globals: {
    'ts-jest': {
      tsConfigFile: 'tsconfig.json'
    }
  }
};