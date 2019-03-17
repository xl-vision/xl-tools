const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const merge = require('webpack-merge')
const { getProjectPath, resolve } = require('../utils/projectHelper')
const path = require('path')

const rootPkg = require(getProjectPath('package.json'))

const webpackBaseConfig = {
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    entry: 'src/index.ts',
    output: {
        path: getProjectPath('dist'),
        // publicPath: config.src.publicPath,
        library: rootPkg.name,
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    externals: {
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDom',
        },
    },
    module: {
        rules: [
            //     {
            //     test: /\.tsx?$/,
            //     exclude: /node_modules/,
            //     enforce: 'pre',
            //     loader: 'tslint-loader',
            //     options: {
            //         configFile: tslintPath,
            //         tsConfigFile: tsconfigPath,
            //         // typeCheck: true,
            //     },
            // },
        ]
    }
}

module.exports = ({ tsConfig, babelConfig, postcssConfig, env, entry, output }) => {
    if (!rootPkg.name) {
        throw new Error(`the name in 'package.json' should be provided`)
    }
    let webpackConfig = merge(webpackBaseConfig, {
        mode: env === 'production' ? 'production' : 'development',
        entry,
        output: {
            path: output,
            library: `${rootPkg.name}`,
            filename: `${rootPkg.name}.${env}.js`
        }
    })

    if (env === 'production') {
        babelConfig.plugins.push([resolve('babel-plugin-transform-react-remove-prop-types'), {
            mode: 'remove',
            ignoreFilenames: ['node_modules']
        }])
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
        })
    }

    return merge(webpackConfig, {
        module: {
            rules: [{
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: babelConfig,
                },
                {
                    loader: 'awesome-typescript-loader',
                    options: {
                        compilerOptions: tsConfig,
                        transpileOnly: true,
                    },
                },
                ],
            }]
        }
    })
}
