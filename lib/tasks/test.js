const jest = require('jest')
const defaultTsConfig = require('../config/tsConfig')
const getJestConfig = require('../config/getJestConfig')
const { getConfig } = require('../utils/runTask')

module.exports = ({ jestConfig, tsConfig, ...others }) => {
    tsConfig = getConfig(tsConfig, 'tsconfig.json') || { ...defaultTsConfig, jsx: 'react', } //支持react运行
    jestConfig = getConfig(jestConfig, 'jest.config.js') || getJestConfig({ tsConfig })

    const jestOptions = { rootDir: process.cwd(), ...jestConfig, ...others }

    return jest.runCLI(jestOptions, [jestOptions.rootDir]).then(results => {
        if (results.numFailedTests || results.numFailedTestSuites) {
            throw new Error('Test Failed')
        }
    })
}