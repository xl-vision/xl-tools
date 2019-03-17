const { getProjectPath } = require('../utils/projectHelper')
const fs = require('fs')

module.exports = {
    strictNullChecks: true,
    target: 'es6',
    jsx: 'preserve',
    moduleResolution: 'node',
    declaration: true,
    noUnusedParameters: true,
    noUnusedLocals: true,
    noImplicitAny: true,
}