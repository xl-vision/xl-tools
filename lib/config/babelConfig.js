const { resolve } = require('../utils/projectHelper')

const getBabelConfig = {
    presets: [
        resolve('@babel/preset-react'),
        resolve('@babel/preset-env')
    ],
    plugins: [
        resolve("@babel/plugin-transform-runtime"),
    ]
}

module.exports = getBabelConfig