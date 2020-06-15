import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import runWebpack from '../utils/runWebpack'
import WebpackDevServer from 'webpack-dev-server'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import getBabelConfig from '../config/getBabelConfig'
import { error } from '../utils/logger'
import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import getEntryFile from '../utils/getEntryFile'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import getTsconfigPath from '../utils/getTsconfigPath'
import CleanUpStatsPlugin from '../utils/CleanUpStatsPlugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import getPostcssConfig from '../config/getPostcssConfig'

export type Alias = {
  [name: string]: string
}

export type Options = {
  entry: string
  dest: string
  demoContainer: string
  dev: boolean
  publicPath: string
  open?: boolean
  port?: number
  tsConfig?: string
  postcssConfig?: string
  sourceMap?: boolean
  demoBox?: string
  alias?: Alias
}
export default (options: Options) => {
  const {
    entry,
    dest,
    demoContainer,
    dev,
    publicPath,
    open,
    port,
    tsConfig,
    postcssConfig,
    sourceMap,
    demoBox,
    alias = {}
  } = options

  // 处理别名，将相对路径转绝对路径
  const handlerAlias: Alias = {}

  for (const name of Object.keys(alias)) {
    const value = getProjectPath(alias[name])
    handlerAlias[name] = value
  }

  const postcssConfigObject = getPostcssConfig(postcssConfig)

  const entryPath = getEntryFile(entry, ['ts', 'tsx', 'js', 'jsx'])

  const isTypescript =
    entryPath.lastIndexOf('.ts') > 0 || entryPath.lastIndexOf('.tsx') > 0

  let tsconfigPath = ''
  if (isTypescript) {
    tsconfigPath = getTsconfigPath(tsConfig)
  }

  const isSourceMap = typeof sourceMap === 'undefined' ? true : sourceMap

  const { plugins, presets } = getBabelConfig({
    es: true,
  })

  plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'))

  if (dev) {
    if (!port) {
      return error('Please provide server port.')
    }
  }

  const getStyleLoaders = (cssOptions: any, preProcessor?: string) => {
    const loaders = [
      dev
        ? require.resolve('style-loader')
        : {
          loader: MiniCssExtractPlugin.loader,
          options: {},
        },
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss',
          sourceMap: isSourceMap,
          ...postcssConfigObject,
        },
      },
    ].filter(Boolean)
    if (preProcessor) {
      const options: any = {
        sourceMap: isSourceMap,
      }
      if (preProcessor === 'sass-loader') {
        options.implementation = require('dart-sass')
        options.sassOptions = {
          fiber: require('fibers'),
        }
      }
      loaders.push({
        loader: require.resolve(preProcessor),
        options,
      })
    }
    return loaders
  }

  const getStyleRules = (
    test: RegExp,
    moduleTest: RegExp,
    cssOptions: any,
    preProcessor?: string
  ) => {
    const rule1: webpack.Rule = {
      test: moduleTest,
      use: getStyleLoaders(
        {
          ...cssOptions,
          modules: {
            localIdentName: dev ? '[local]__[hash:base64]' : '[hash:base64]',
          },
          // 支持驼峰导入
          localsConvention: 'camelCase',
        },
        preProcessor
      ),
    }
    const rule2: webpack.Rule = {
      test,
      exclude: moduleTest,
      use: getStyleLoaders({ ...cssOptions, modules: false }, preProcessor),
      sideEffects: true,
    }
    return [rule1, rule2]
  }

  const config: webpack.Configuration = {
    entry: entryPath,
    output: {
      path: getProjectPath(dest),
      filename: dev
        ? 'static/js/[name].js'
        : 'static/js/[name].[contenthash:8].js',
      chunkFilename: dev
        ? 'static/js/[name].chunk.js'
        : 'static/js/[name].[contenthash:8].chunk.js',
      publicPath: dev ? '/' : publicPath,
    },
    mode: dev ? 'development' : 'production',
    bail: !dev,
    devtool: isSourceMap && (dev ? 'cheap-module-source-map' : 'source-map'),
    resolve: {
      extensions: [
        '.js',
        '.jsx',
        '.ts',
        '.tsx',
        '.json',
        '.md',
        '.mdx',
        '.css',
        '.scss',
        '.sass',
        '.less',
        '.styl',
      ],
      alias: {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-native': 'react-native-web',
        // 项目
        '@': getProjectPath(''),
        ...handlerAlias
      },
    },
    optimization: {
      minimize: !dev,
      concatenateModules: !dev,
      minimizer: [
        new OptimizeCSSAssetsPlugin({
          cssProcessorOptions: {
            map: isSourceMap
              ? {
                inline: false,
                annotation: true,
              }
              : false,
          },
        }),
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8,
            },
            compress: {
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: {
              safari10: true,
            },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
          parallel: true,
          cache: true,
          sourceMap: isSourceMap,
        }),
      ],
      splitChunks: {
        chunks: 'all',
        name: true,
      },
      runtimeChunk: true,
    },
    module: {
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        {
          test: /\.(js|jsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/,
          options: {
            babelrc: false,
            configFile: false,
            plugins: plugins,
            presets: presets,
          },
        },
        {
          test: /\.(ts|tsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/,
          options: {
            babelrc: false,
            configFile: false,
            plugins: plugins,
            presets: presets.concat(
              require.resolve('@babel/preset-typescript')
            ),
          },
        },
        {
          test: /\.(md|mdx)$/,
          exclude: /node_modules/,
          sideEffects: true,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                babelrc: false,
                configFile: false,
                plugins: plugins,
                presets: presets,
              },
            },
            {
              loader: require.resolve('../mdLoader'),
              options: {
                demoContainer,
                demoBox,
                // 只可以传递文件路径
                postcssConfigFile:
                  postcssConfig && getProjectPath(postcssConfig),
                cssConfig: {
                  sourceMap: isSourceMap,
                  esModule: true,
                },
              },
            },
          ],
        },
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          loader: require.resolve('url-loader'),
          options: {
            limit: 10000,
            name: 'static/img/[name].[hash:8].[ext]',
          },
        },
        ...getStyleRules(/\.css$/, /\.module\.css$/, {
          importLoaders: 1,
          sourceMap: isSourceMap,
          esModule: true,
        }),
        ...getStyleRules(
          /\.(scss|sass)$/,
          /\.module\.(scss|sass)$/,
          {
            importLoaders: 2,
            sourceMap: isSourceMap,
            esModule: true,
          },
          'sass-loader'
        ),
        ...getStyleRules(
          /\.less$/,
          /\.module\.less$/,
          {
            importLoaders: 2,
            sourceMap: isSourceMap,
            esModule: true,
          },
          'less-loader'
        ),
        ...getStyleRules(
          /\.styl$/,
          /\.module\.styl$/,
          {
            importLoaders: 2,
            sourceMap: isSourceMap,
            esModule: true,
          },
          'stylus-loader'
        ),
      ],
    },
    plugins: [
      !dev &&
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
      isTypescript &&
      new ForkTsCheckerWebpackPlugin({
        async: dev,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        tsconfig: tsconfigPath,
        // silent: true
      }),
      new CaseSensitivePathsPlugin(),
      new CleanUpStatsPlugin(),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how Webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path
              .join(getProjectPath(entryPath), '../public', '**/*')
              .replace(/\\/g, '/'),
            to: dev ? 'public' : path.join(getProjectPath(dest), 'public'),
            toType: 'dir',
          },
        ],
      }),
      dev && new Webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        inject: true,
        template: path.join(getProjectPath(entryPath), '../index.html'),
        // 传递当前的publicPath给页面
        publicPath,
        ...(dev
          ? {}
          : {
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
          }),
      }),
      !dev &&
      new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
    ].filter(Boolean) as any[],
  }

  const devServer: WebpackDevServer.Configuration = {
    compress: true,
    clientLogLevel: 'warning',
    contentBase: false,
    hot: true,
    publicPath: '/',
    historyApiFallback: true,
    port,
    open,
    watchOptions: {
      ignored: [/node_modules/],
    },
  }

  return runWebpack(config, dev ? devServer : undefined)
}
