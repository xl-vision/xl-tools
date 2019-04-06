module.exports = {
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/src/**/*.js'
  ],

  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFiles: [],

  // The test environment that will be used for testing
  testEnvironment: 'node',


  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/test/**/*.test.js'
  ]
}