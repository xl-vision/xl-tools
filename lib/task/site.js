const webpack = require('webpack')
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

// ForkTsCheckerWebpackPlugin要求项目下有tsconfig.json
// 检测根项目下是否有tsconfig.json, 如果没有，自动生成
function tsconfigFileCheck (tsCheckIncludes, tsconfigTemplatePath) {
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    return
  }
  const json = fs.readJSONSync(tsconfigTemplatePath)
  json.include = tsCheckIncludes
  fs.writeJSONSync(tsconfigPath, json)
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
  alias
}) => {
  tsconfigFileCheck(tsCheckIncludes, tsconfigPath)

  const isSourceMap = true
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
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
      publicPath: isProduction ? publicPath : '/'
    },
    resolve: {
      alias
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
        chunk: 'all',
        name: false
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
          test: /\.scss$/,
          use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isProduction && isSourceMap
          }, 'sass-loader'),
          sideEffects: true
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
        tsconfig: true,
        silent: true
      }),
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
      isDevelopment && new webpack.HotModuleReplacementPlugin(),
      isDevelopment && new WatchMissingNodeModulesPlugin(path.resolve(process.cwd, 'node_modules')),
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
