const { getProjectPath } = require('../utils/projectHelper')
const fs = require('fs')

module.exports = {
    strictNullChecks: true,
    target: 'esnext',
    jsx: 'preserve',
    moduleResolution: 'node',
    declaration: true,
    noUnusedParameters: true,
    noUnusedLocals: true,
    noImplicitAny: true,
}