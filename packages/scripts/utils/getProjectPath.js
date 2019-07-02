const path = require('path')

module.exports = (...filepath) => path.resolve(process.cwd(), ...filepath)