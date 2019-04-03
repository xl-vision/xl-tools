const jest = require('jest')
const getJestConfig = require('../config/getJestConfig')
const path = require('path')
const {
    exist,
    getProjectPath
} = require('../utils/projectHelper')

module.exports = ({
    jestConfig,
    tsConfig,
    ...others
}) => {

    if (tsConfig) {
        if (exist(tsConfig)) {
            tsConfig = getProjectPath(tsConfig)
        } else {
            throw new Error(`The typescript config file: '${tsConfig}' does not exist`)
        }
    } else if (exist('tsconfig.json')) {
        tsConfig = getProjectPath('tsconfig.json')
    } else {
        tsConfig = path.join(__dirname, '../config/tsconfig.json')
    }

    if (jestConfig) {
        if (exist(jestConfig)) {
            jestConfig = require(getProjectPath(jestConfig))
        } else {
            throw new Error(`The jest config file: '${jestConfig}' does not exist`)
        }
    } else if (exist('jest.config.js')) {
        jestConfig = require(getProjectPath('jest.config.js'))
    } else {
        jestConfig = getJestConfig({
            tsConfig
        })
    }

    //合并命令行参数
    jestConfig = {
        rootDir: process.cwd(),
        ...jestConfig,
        ...others
    }

    return jest.runCLI(jestConfig, [jestConfig.rootDir]).then(results => {
        if (results.numFailedTests || results.numFailedTestSuites) {
            throw new Error('Test Failed')
        }
    })
}