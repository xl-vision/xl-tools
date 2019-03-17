const { resolve } = require('../utils/projectHelper')

const getBabelConfig = (modules = 'auto') => ({
    presets: [
        [resolve('@babel/preset-env'), {
            modules
        }],
        resolve('@babel/preset-react'),
    ],
    plugins: [
        resolve("@babel/plugin-transform-runtime"),
    ]
})

module.exports = getBabelConfig