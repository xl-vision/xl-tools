const path = require('path')

const cwd = process.cwd()

const getProjectPath = (...filepath) => path.join(cwd, ...filepath)
const resolve = moduleName => require.resolve(moduleName)

module.exports = {
    getProjectPath,
    resolve
}