const webpack = require('webpack')
const message = require('../utils/message')
const baseWebpackConfig = require('../config/webpackConfig')
const getBabelConfig = require('../config/getBabelConfig')
const defaultTsConfig = require('../config/tsConfig')
const { getProjectPath, exist, resolve } = require('../utils/projectHelper')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const merge = require('webpack-merge')
// const { CheckerPlugin  } = require('awesome-typescript-loader')

module.exports = ({ webpackConfig, tsConfig, babelConfig, env, entry, output }) => {

    if (webpackConfig) {
        if (exist(webpackConfig)) {
            return runWebpack(require(getProjectPath(webpackConfig)))
        } else {
            throw new Error(`The webpack config file: '${webpackConfig}' does not exist`)
        }
    } else if (exist('webpack.config.js')) {
        return runWebpack(require(getProjectPath('webpack.config.js')))
    }

    env = env || 'production'
    //entry和output需要绝对路径
    if (entry && !exist(entry)) {
        throw new Error(`The entry: '${entry}' does not exist`)
    }
    if (output && !exist(output)) {
        throw new Error(`The entry: '${output}' does not exist`)
    }
    entry = getProjectPath(entry || 'src/scripts')
    output = getProjectPath(output || 'dist')

    let libraryName = 'index'
    //尝试使用package.json中的名字
    if (exist('package.json')) {
        libraryName = require(getProjectPath('package.json')).name || 'index'
    }

    let babelOptions = {}
    if (babelConfig) {
        if (exist(babelConfig)) {
            babelOptions.configFile = getProjectPath(babelConfig)
        } else {
            throw new Error(`The babel config file: '${babelConfig}' does not exist`)
        }
    } else if (exist('babel.config.js')) {
        babelOptions.configFile = getProjectPath('babel.config.js')
    } else {
        babelOptions = getBabelConfig()
        if (env === 'production') {
            babelOptions.plugins.push([resolve('babel-plugin-transform-react-remove-prop-types'), {
                mode: 'remove',
                ignoreFilenames: ['node_modules']
            }])
        }
    }

    const babelRule = {
        loader: 'babel-loader',
        options: babelOptions,
    }

    const tsRule = {
        loader: 'awesome-typescript-loader',
        options: {
            transpileOnly: true,
        },
    }

    if (tsConfig) {
        if (exist(tsConfig)) {
            tsRule.options.configFileName = getProjectPath(tsConfig)

        } else {
            throw new Error(`The typescript config file: '${tsConfig}' does not exist`)
        }
    } else if (exist('tsconfig.json')) {
        tsRule.options.configFileName = getProjectPath('tsconfig.json')
    } else {
        tsRule.options.compilerOptions = defaultTsConfig
    }

    webpackConfig = merge(baseWebpackConfig, {
        mode: env === 'production' ? 'production' : 'development',
        entry,
        output: {
            path: output,
            library: `${libraryName}`,
            filename: `${libraryName}.${env}.js`
        },
        module: {
            rules: [{
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [babelRule, tsRule],
            }]
        },
        plugins: [
            // new CheckerPlugin()
        ]
    })



    if (env === 'production') {
        webpackConfig = merge(webpackConfig, {
            optimization: {
                minimizer: [
                    new UglifyJsPlugin({
                        cache: true,
                        parallel: true,
                        sourceMap: true,
                    })
                ]
            },
            plugins: [
                new webpack.optimize.ModuleConcatenationPlugin(),
            ]
        })
    }

    return runWebpack(webpackConfig)
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