import getEntryFile from '../utils/getEntryFile'
import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import checkTsCondition from '../utils/checkTsCondition'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import merge from 'webpack-merge'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import runWebpack from '../utils/runWebpack'
import getBabelConfig from '../lib/getBabelConfig'
import WebpackDevServer from 'webpack-dev-server'

export type Options = {
  isProduction: boolean,
  entry?: string
  publicPath?: string
}

export default (options: Options) => {
  const {
    isProduction,
    entry = getEntryFile('site', ['ts', 'tsx', 'js', 'jsx']),
    publicPath = '/'
  } = options

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

  const tsSrc = [`src/**/*.ts?(x)`, `!src/**/{test,doc}/**`]
  const tsConfigFile = getProjectPath('tsconfig.json')

  const config = getBaseWebpackConfig({
    isProduction,
    isSourceMap,
    useTsCheckerPlugin: checkTsCondition(tsSrc, tsConfigFile),
    tsConfigFile
  })

  const extraConfig: Webpack.Configuration = {
    entry,
    output: {
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
        site: getProjectPath('site')
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
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                ...getBabelConfig({
                  target: 'site',
                  isTypescript: true
                })
              }
            },
            '@mdx-js/loader',
            require.resolve('../utils/mdLoader'),
          ]
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
        },
      ]
    }
  }

  const devServer: WebpackDevServer.Configuration = {
    compress: true,
    clientLogLevel: 'warning',
    contentBase: false,
    hot: true,
    publicPath: '/',
    historyApiFallback: true,
    port: 3000
  }

  const allConfig = merge(config, extraConfig)

  return runWebpack(allConfig, devServer)
}
