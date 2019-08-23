import getEntryFile from '../utils/getEntryFile'
import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import checkTsCondition from '../utils/checkTsCondition'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import merge from 'webpack-merge'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import runWebpack from '../utils/runWebpack'
import WebpackDevServer from 'webpack-dev-server'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import { DOCS_DIR, SITE_DIR, SOURCE_DIR } from './entry'

export type Options = {
  isProduction: boolean
  publicPath?: string,
  port?: number
}

const libraryName = require(getProjectPath('package.json')).name

const outputDir = getProjectPath(DOCS_DIR)
const inputDir = getProjectPath(SITE_DIR)
const srcDir = getProjectPath(SOURCE_DIR)

export default (options: Options) => {
  const { isProduction, publicPath = '/', port = 3000 } = options

  const isSourceMap = true

  const getStyleLoaders = (cssOptions: any, preProcessor?: string) => {
    const loaders = [
      isProduction
        ? {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          }
        : require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: cssOptions
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
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

  const tsSrc = [`${SOURCE_DIR}/**/*.ts?(x)`, `!${SOURCE_DIR}/**/{test,doc}/**`]
  const tsConfigFile = getProjectPath('tsconfig.json')

  const config = getBaseWebpackConfig({
    isProduction,
    isSourceMap,
    useTsCheckerPlugin: checkTsCondition(tsSrc, tsConfigFile),
    tsConfigFile
  })

  const extraConfig: Webpack.Configuration = {
    entry: getEntryFile(inputDir, ['ts', 'tsx', 'js', 'jsx']),
    output: {
      path: outputDir,
      filename: isProduction
        ? 'static/js/[name].[contenthash:8].js'
        : 'static/js/[name].js',
      chunkFilename: isProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      publicPath: isProduction ? publicPath : '/'
    },
    resolve: {
      extensions: ['.md', '.mdx', '.scss'],
      alias: {
        site: inputDir,
        [libraryName]: getEntryFile(srcDir, ['ts', 'tsx', 'js', 'jsx'])
      }
    },
    optimization: {
      // 不设置，会导致引入组件缺失，如Row.Col undefined
      sideEffects: false,
      minimizer: [
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: isSourceMap
              ? {
                  inline: false,
                  annotation: true
                }
              : false
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
          test: /\.(md|mdx)$/,
          use: [require.resolve('../utils/mdLoader')]
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
          test: /\.scss/,
          use: getStyleLoaders(
            {
              importLoaders: 2,
              sourceMap: isProduction && isSourceMap
            },
            'sass-loader'
          ),
          sideEffects: true
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/images/[name].[hash:8].[ext]'
          }
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        {
          from: path.join(inputDir, 'public'),
          to: isProduction ? path.join(outputDir, 'public') : 'public',
          ignore: ['.*']
        }
      ]),
      !isProduction && new Webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.join(inputDir, 'index.html'),
        // 传递当前的publicPath给页面
        publicPath,
        ...(isProduction
          ? {
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
            }
          : {})
      }),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: 'static/css/[name].[contenthash:8].css',
          chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
        })
    ].filter(Boolean) as any[]
  }

  const devServer: WebpackDevServer.Configuration = {
    compress: true,
    clientLogLevel: 'warning',
    contentBase: false,
    hot: true,
    publicPath: '/',
    historyApiFallback: true,
    port
  }

  const allConfig = merge(config, extraConfig)

  return runWebpack(allConfig, isProduction ? undefined : devServer)
}
