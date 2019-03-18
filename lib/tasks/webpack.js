const webpack = require('webpack')
const merge = require('webpack-merge')
const message = require('../utils/message')
const getWebpackConfig = require('../config/getWebpackConfig')
const defaultPostcssConfig = require('../config/postcssConfig')
const getBabelConfig = require('../config/getBabelConfig')
const defaultTsConfig = require('../config/tsConfig')
const { getConfig } = require('../utils/runTask')

module.exports = ({ webpackConfig, tsConfig, babelConfig, postcssConfig, env, entry, output }) => {
    tsConfig = (getConfig(tsConfig, 'tsconfig.json') || {}).compilerOptions || defaultTsConfig
    babelConfig = getConfig(babelConfig, 'babel.config.json') || getBabelConfig()
    postcssConfig = getConfig(postcssConfig, 'postcss.config.js') || defaultPostcssConfig

    webpackConfig = getConfig(webpackConfig, 'webpack.config.js') || getWebpackConfig({ tsConfig, babelConfig, postcssConfig, env, entry, output })

    return runWebpack(merge(defaultConfig, webpackConfig))
}

function runWebpack(config) {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) {
                return reject(err)
            }
            const info = stats.toJson()

            if (stats.hasErrors()) {
                return reject(info.errors)
            }

            if (stats.hasWarnings()) {
                message.warn(info.warnings)
            }

            const buildInfo = stats.toString({
                colors: true,
                children: true,
                chunks: false,
                modules: false,
                chunkModules: false,
                hash: false,
                version: false,
            })
            message.info(buildInfo)
            return resolve()
        })
    })
}