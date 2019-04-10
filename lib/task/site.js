const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('../utils/WatchMissingNodeModulesPlugin')
const path = require('path')
const ManifestPlugin = require('webpack-manifest-plugin')
const getBaseWebpackConfig = require('../config/getBaseWebpackConfig')
const merge = require('webpack-merge')
const runWebpack = require('../utils/runWebpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs-extra')
const CopyWebpackPlugin = require('copy-webpack-plugin')

// 默认tsConfig路径
const projectTsconfigPath = path.join(process.cwd(), 'tsconfig.json')

// ForkTsCheckerWebpackPlugin要求项目下有tsconfig.json
// 检测根项目下是否有tsconfig.json, 如果没有，自动生成
function tsconfigFileCheck (tsCheckIncludes, tsconfigTemplatePath) {
  if (fs.existsSync(projectTsconfigPath)) {
    return
  }
  const json = fs.readJSONSync(tsconfigTemplatePath)
  json.include = tsCheckIncludes
  fs.writeJSONSync(projectTsconfigPath, json, {
    spaces: 4
  })
}

module.exports = ({
  isProduction,
  input,
  output,
  publicPath,
  postcssConfig,
  babelConfig,
  htmlTemplate,
  tsconfigPath,
  tsCheckIncludes,
  alias,
  mdLoaderOptions // {mdCodeComponentPath, clsPrefix}
}) => {
  if (!path.isAbsolute(input)) {
    input = path.join(process.cwd(), input)
  }
  if (!path.isAbsolute(output)) {
    output = path.join(process.cwd(), output)
  }

  let mdCodeComponentPath = mdLoaderOptions.mdCodeComponentPath
  if (mdCodeComponentPath && !path.isAbsolute(mdCodeComponentPath)) {
    mdCodeComponentPath = path.join(process.cwd(), mdCodeComponentPath)
  }

  const isSourceMap = true

  tsconfigFileCheck(tsCheckIncludes, tsconfigPath)

  const baseWebpackConfig = getBaseWebpackConfig({
    isProduction,
    input,
    output,
    babelConfig,
    isSourceMap
    // bannerMessage
  })
  const isDevelopment = !isProduction

  if (typeof postcssConfig === 'string') {
    postcssConfig = require(postcssConfig)
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
          sourceMap: isProduction && isSourceMap
        }
      })
    }
    return loaders
  }
  const webpackExtraConfig = {
    output: {
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath: isProduction ? publicPath : '/'
    },
    resolve: {
      alias
    },
    devServer: {
      compress: true,
      clientLogLevel: 'warning',
      contentBase: false,
      hot: true,
      publicPath: '/',
      historyApiFallback: true,
      stats: baseWebpackConfig.stats,
      port: 3000
    },
    optimization: {
      minimizer: [
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
        chunks: 'all',
        name: true
      },
      runtimeChunk: true
    },
    module: {
      rules: [
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/images/[name].[hash:8].[ext]'
          }
        },
        {
          test: /\.css$/,
          use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isProduction && isSourceMap
          }),
          sideEffects: true
        },
        {
          test: /\.scss$/,
          use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isProduction && isSourceMap
          }, 'sass-loader'),
          sideEffects: true
        },
        {
          test: /\.md$/,
          use: [{
            loader: require.resolve('babel-loader'),
            options: {
              ...babelConfig,
              babelrc: false,
              configFile: false
            }
          }, {
            loader: require.resolve('../utils/mdLoader'),
            options: {
              ...mdLoaderOptions,
              mdCodeComponentPath
            }
          }]
        }
        // {
        //   loader: require.resolve('file-loader'),
        //   exclude: [/\.(js|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
        //   options: {
        //     name: 'static/media/[name].[hash:8].[ext]'
        //   }
        // }
      ]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        async: isDevelopment,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        tsconfig: projectTsconfigPath
        // silent: true
      }),
      new CopyWebpackPlugin([
        {
          from: path.join(path.dirname(input), 'public'),
          to: isProduction ? path.join(output, 'public') : 'public',
          ignore: ['.*']
        }
      ]),
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
              minifyURLs: true
            }
          } : {}
        )
      }),
      isDevelopment && new WatchMissingNodeModulesPlugin(path.resolve(process.cwd(), 'node_modules')),
      isProduction && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
      }),
      new ManifestPlugin({
        fileName: 'asset-manifest.json',
        publicPath
      })
    ].filter(Boolean)
  }

  const webpackConfig = merge(baseWebpackConfig, webpackExtraConfig)
  return runWebpack(webpackConfig, isDevelopment)
}
