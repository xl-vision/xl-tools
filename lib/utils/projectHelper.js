const path = require('path')
const fs = require('fs')
const cwd = process.cwd()

const getProjectPath = (...filepath) => path.join(cwd, ...filepath)
const resolve = moduleName => require.resolve(moduleName)


const exist = file => {
    const path = getProjectPath(file)
    return fs.existsSync(path)
}

module.exports = {
    getProjectPath,
    resolve,
    exist
}