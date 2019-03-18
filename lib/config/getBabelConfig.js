const { resolve } = require('../utils/projectHelper')

const getBabelConfig = (modules = 'auto') => {
    //confirm '@babel/runtime' is installed
    try {
        resolve('@babel/runtime/package.json')
    } catch (err) {
        throw new Error(`the module '@babel/runtime' doesn't exist, please install it with command: 'npm i @babel/runtime -S'`)
    }
    return {
        presets: [
            [resolve('@babel/preset-env'), {
                modules
            }],
            resolve('@babel/preset-react'),
        ],
        plugins: [
            resolve("@babel/plugin-transform-runtime")
        ]
    }
}

module.exports = getBabelConfig