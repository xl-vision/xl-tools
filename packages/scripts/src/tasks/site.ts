import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import merge from 'webpack-merge'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import runWebpack from '../utils/runWebpack'
import WebpackDevServer from 'webpack-dev-server'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'

export type Options = {
  src: string
  dest: string,
  dev: boolean
  demoBoxPath: string
  librarySrc: string,
  publicPath?: string,
  port?: number,
  tsConfigFile?: string,
}
const libraryName = require(getProjectPath('package.json')).name
export default (options: Options) => {
  const {
    src,
    dest,
    dev,
    publicPath,
    port,
    tsConfigFile,
    demoBoxPath,
    librarySrc,
  } = options

  const isSourceMap = true

  if (dev) {
    if (!port) {
      throw new Error("Please provide server port.")
    }
  } else {
    if (!publicPath) {
      throw new Error("Please provide public path for deploy.")
    }
  }

  const getStyleLoaders = (cssOptions: any, preProcessor?: string) => {
    const loaders = [
      (dev ? require.resolve('style-loader') : {
        loader: MiniCssExtractPlugin.loader,
        options: {}
      }), {
        loader: require.resolve('css-loader'),
        options: cssOptions
      }, {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          sourceMap: isSourceMap
        }
      }
    ].filter(Boolean)
    if (preProcessor) {
      loaders.push({
        loader: require.resolve(preProcessor),
        options: {
          sourceMap: isSourceMap
        }
      })
    }
    return loaders
  }

  const config = getBaseWebpackConfig({
    dev,
    tsCheck: true,
    tsCheckAsync: dev,
    tsConfigFile
  })

  const extraConfig: Webpack.Configuration = {
    entry: getProjectPath(src),
    output: {
      path: getProjectPath(dest),
      filename: dev ? 'static/js/[name].js' : 'static/js/[name].[contenthash:8].js',
      chunkFilename: dev ? 'static/js/[name].chunk.js' : 'static/js/[name].[contenthash:8].chunk.js',
      publicPath: dev ? '/' : publicPath
    },
    resolve: {
      extensions: ['.md', '.mdx', '.scss'],
      alias: {
        // 指定DemoBox的路径
        'demo-box': getProjectPath(demoBoxPath),
        // 项目
        [libraryName]: getProjectPath(librarySrc)
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
            sourceMap: isSourceMap
          }),
          sideEffects: true
        },
        {
          test: /\.scss/,
          use: getStyleLoaders(
            {
              importLoaders: 2,
              sourceMap: isSourceMap
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
          from: path.join(getProjectPath(src), 'public'),
          to: dev ? 'public' : path.join(getProjectPath(dest), 'public'),
          ignore: ['.*']
        }
      ]),
      dev && new Webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.join(getProjectPath(src), 'index.html'),
        // 传递当前的publicPath给页面
        publicPath,
        ...(
          dev ? {} : {
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
        )
      }),
      !dev &&
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

  return runWebpack(allConfig, dev ? devServer : undefined)
}
