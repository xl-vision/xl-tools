
const { exist, getProjectPath } = require('./projectHelper')
const fs = require('fs')

const promisefyStream = stream => {
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve()
        })
        stream.on('error', function (error) {
            reject(error)
        })
    })
}

const getConfig = (file, defaultFile) => {
    if (file && !exist(file)) {
        throw new Error(`The file '${file} doesn't exist`)
    }
    let config
    const filePath = getProjectPath(file || defaultFile)
    if (fs.existsSync(filePath)) {
        config = require(filePath)
    }
    return config
}

module.exports = {
    promisefyStream,
    getConfig
}