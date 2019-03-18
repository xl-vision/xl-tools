const jest = require('jest')
const defaultTsConfig = require('../config/tsConfig')
const getJestConfig = require('../config/getJestConfig')

module.exports = ({ jestConfig, tsConfig, ...others }) => {
    tsConfig = tsConfig || defaultTsConfig
    jestConfig = jestConfig || getJestConfig({ tsConfig })

    const jestOptions = { rootDir: process.cwd(), ...jestConfig, ...others }

    return jest.runCLI(jestOptions, [jestOptions.rootDir]).then(results => {
        if (results.numFailedTests || results.numFailedTestSuites) {
            throw new Error('Test Failed')
        }
    })
}