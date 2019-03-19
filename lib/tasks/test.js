const jest = require('jest')
const defaultTsConfig = require('../config/tsConfig')
const getJestConfig = require('../config/getJestConfig')
const { exist, getProjectPath } = require('../utils/projectHelper')

module.exports = ({ jestConfig, tsConfig, ...others }) => {

    if (tsConfig) {
        if (exist(tsConfig)) {
            // file path
            tsConfig = getProjectPath(tsConfig)
        } else {
            throw new Error(`The typescript config file: '${tsConfig}' does not exist`)
        }
    } else if (exist('tsconfig.json')) {
        // file path
        tsConfig = getProjectPath('tsconfig.json')
    } else {
        // file content
        tsConfig = defaultTsConfig
    }

    if (jestConfig) {
        if (exist(jestConfig)) {
            jestConfig = require(getProjectPath(jestConfig))
        } else {
            throw new Error(`The jest config file: '${jestConfig}' does not exist`)
        }
    } else if (exist('jest.config.js')) {
        jestConfig = require(getProjectPath(jestConfig))
    } else {
        jestConfig = getJestConfig({ tsConfig })
    }

    //合并命令行参数
    jestConfig = { rootDir: process.cwd(), ...jestConfig, ...others }

    return jest.runCLI(jestConfig, [jestConfig.rootDir]).then(results => {
        if (results.numFailedTests || results.numFailedTestSuites) {
            throw new Error('Test Failed')
        }
    })
}