const path = require('path')

module.exports = (...filePath) => path.resolve(process.cwd(), ...filePath)
