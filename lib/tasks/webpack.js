const webpack = require('webpack')
const message = require('../utils/message')
const baseWebpackConfig = require('../config/webpackConfig')
const getBabelConfig = require('../config/getBabelConfig')
const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

const {
    getProjectPath,
    exist,
    resolve
} = require('../utils/projectHelper')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const merge = require('webpack-merge')

module.exports = ({
    webpackConfig,
    tsConfig,
    babelConfig,
    env,
    entry,
    output
}) => {

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
    entry = getProjectPath(entry || 'src/package')
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
        loader: 'ts-loader',
        options: {
            // Please note, that if the configuration file is outside of your project directory, 
            // you might need to set the context option to avoid TypeScript issues (like TS18003). 
            // In this case the configFile should point to the tsconfig.json and context to the project root.
            // see: https://github.com/TypeStrong/ts-loader/#configfile-string-defaulttsconfigjson
            context: getProjectPath('.'),
            transpileOnly: true,
            happyPackMode: true
        },
    }
    let tsConfigPath
    // ForkTsCheckerWebpackPlugin will case TS18003 when used default tsconfig.json in config directory
    let enableChecker = true
    if (tsConfig) {
        if (exist(tsConfig)) {
            tsConfigPath = getProjectPath(tsConfig)
        } else {
            throw new Error(`The typescript config file: '${tsConfig}' does not exist`)
        }
    } else if (exist('tsconfig.json')) {
        tsConfigPath = getProjectPath('tsconfig.json')
    } else {
        enableChecker = false
        tsConfigPath = path.join(__dirname, '../config/tsconfig.json')
    }
    tsRule.options.configFile = tsConfigPath

    const forkTsCheckerWebpackPluginConfig = {
        checkSyntacticErrors: true,
        tsconfig: tsConfigPath,
        measureCompilationTime: true
        // workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE
    }

    if (env === 'production') {
        forkTsCheckerWebpackPlugin.async = false

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
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(env)
            })
        ]
    })
    if (enableChecker) {
        webpackConfig.plugins.push(
            new ForkTsCheckerWebpackPlugin(forkTsCheckerWebpackPluginConfig)
        )
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

            const buildInfo = stats.toString(Object.assign({
                colors: true,
                children: true,
                chunks: false,
                modules: false,
                chunkModules: false,
                hash: false,
                version: false,

            }, config.stats))
            message.info(buildInfo)
            return resolve()
        })
    })
}