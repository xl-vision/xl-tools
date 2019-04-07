const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('../utils/WatchMissingNodeModulesPlugin')
const path = require('path')
const ManifestPlugin = require('webpack-manifest-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')

module.exports = ({
    env,
    input,
    output,
    publicPath,
    postcssConfig,
    babelConfig,
    htmlTemplate,
    tsconfigPath
}) => {
    const isProduction = env === 'production'
    const isDevelopment = !isProduction
    const isSourceMap = true

    if(typeof postcssConfig === 'string'){
        postcssConfig = require(postcssConfig)
    }

    if(typeof babelConfig === 'string'){
        babelConfig = require(babelConfig)
    }

    const getStyleLoaders = (cssOptions, preProcessor) => {
        const loaders = [
            isDevelopment && require.resolve('style-loader'),
            isProduction && {
                loader: MiniCssExtractPlugin.loader,
                options: {}
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions
            },
            {
                loader: require.resolve('postcss-loader'),
                options: {
                    ...postcssConfig,
                    ident: 'postcss',
                    sourceMap: isProduction && isSourceMap
                }
            }
        ].filter(Boolean)

        if (preProcessor) {
            loaders.push({
              loader: require.resolve(preProcessor),
              options: {
                sourceMap: isProduction && isSourceMap,
              },
            })
        }
        return loaders
    }
    const webpackConfig = {
        mode: isProduction?'production': 'development',
        bail: isProduction,
        devtool: isProduction ? isSourceMap ? 'source-map': false: 'cheap-module-source-map',
        entry: [
            input
        ].filter(Boolean),
        output: {
            path: output,
            pathinfo: isDevelopment,
            filename: isProduction ? 'static/js/[name].[contenthash:8].js': 'js/[name].js',
            chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js': 'js/[name].chunk.js',
            publicPath: isProduction ? publicPath : '/',
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            ecma: 8
                        },
                        compress:{
                            ecma: 5,
                            warnings: false,
                            comparisons: false,
                            inline: 2,
                        },
                        mangle: {
                            safari10: true
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                            ascii_only: true
                        }
                    },
                    parallel: true,
                    cache: true,
                    sourceMap: isSourceMap
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        map: isSourceMap ? {
                            inline: false,
                            annotation: true
                        } : false
                    }
                })
            ],
            splitChunks: {
                chunk: 'all',
                name: false
            },
            runtimeChunk: true
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.scss'],
            alias: {
                'react-native': 'react-native-web'
            },
            plugins: [
            
            ]
        },
        module: {
            strictExportPresence: true,
            rules: [
                // Disable require.ensure as it's not a standard language feature.
                { parser: { requireEnsure: false } },
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: 'static/images/[name].[hash:8].[ext]',
                            },
                        },
                        {
                            test: /\.(js|jsx|ts|tsx)$/,
                            loader: require.resolve('babel-loader'),
                            exclude: /node_modules/,
                            options: {
                                ...babelConfig,
                                babelrc: false,
                                configFile: false,
                            }
                        },
                        {
                            test: /\.scss$/,
                            use: getStyleLoaders({
                                importLoaders: 2,
                                sourceMap: isProduction && isSourceMap
                            },'sass-loader'),
                            sideEffects: true
                        },
                        {
                            loader: require.resolve('file-loader'),
                            exclude: [/\.(js|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        }
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: htmlTemplate,
                ...(
                    isProduction ? {
                        minify: {
                            removeComments: true,
                            collapseWhitespace: true,
                            removeRedundantAttributes: true,
                            useShortDoctype: true,
                            removeEmptyAttributes: true,
                            removeStyleLinkTypeAttributes: true,
                            keepClosingSlash: true,
                            minifyJS: true,
                            minifyCSS: true,
                            minifyURLs: true,
                        }, 
                    } : {}
                )
            }),
            isDevelopment && new webpack.HotModuleReplacementPlugin(),
            isDevelopment && new WatchMissingNodeModulesPlugin(path.resolve(process.cwd,'node_modules')),
            isProduction && new MiniCssExtractPlugin({
                filename: 'static/css/[name].[contenthash:8].css',
                chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
            }),
            new ManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath,
            }),
            // Moment.js is an extremely popular library that bundles large locale files
            // by default due to how Webpack interprets its code. This is a practical
            // solution that requires the user to opt into importing specific locales.
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            // You can remove this if you don't use Moment.js:
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new ForkTsCheckerWebpackPlugin({
                async: isDevelopment,
                useTypescriptIncrementalApi: true,
                checkSyntacticErrors: true,
                tsconfig: tsconfigPath,
                silent: true
            })
        ].filter(Boolean),
    }

    return runWebpack(webpackConfig, isDevelopment)
}


function runWebpack(config, isDev) {
    const compiler = webpack(config)
    const promise = new Promise((resolved,rejected) => {
        if(isDev){
            const devServer = new WebpackDevServer(compiler,{
                compress: true,
                clientLogLevel: 'none',
                contentBase: false,
                hot: true,
                publicPath: '/',
                historyApiFallback: true,
                stats: config.stats
            })
            devServer.listen(3000,'localhost',err => {
                if(err) {
                    rejected(err)
                    return
                }

                console.log(chalk.cyan('Starting the development server in port 3000\n'));
            })
            return
        }

        compiler.run((err, stats) => {
            if (err) {
                return rejected(err)
            }
            const info = stats.toJson()

            if (stats.hasErrors()) {
                return rejected(info.errors)
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
            console.info(buildInfo)
            return resolved()
        })
    })
    

    return promise
}