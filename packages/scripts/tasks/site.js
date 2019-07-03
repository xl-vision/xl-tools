const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('../utils/WatchMissingNodeModulesPlugin')
const path = require('path')
const ManifestPlugin = require('webpack-manifest-plugin')
const getBaseWebpackConfig = require('../lib/getBaseWebpackConfig')
const merge = require('webpack-merge')
const runWebpack = require('../utils/runWebpack')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const fs = require('fs-extra')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')

module.exports = ({
  isProduction,
  isSourceMap = true,
  publicPath = '/',
  alias,
  port = 3000
}) => {

  const isDevelopment = !isProduction

  const baseWebpackConfig = getBaseWebpackConfig({
    isProduction,
    isSourceMap,
  })

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
  const webpackExtraConfig = {
    output: {
      filename: isProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
      chunkFilename: isProduction ? 'static/js/[name].[contenthash:8].chunk.js' : 'static/js/[name].chunk.js',
      publicPath
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
      // stats: baseWebpackConfig.stats,
      port,
    },
    optimization: {
      // 不设置，会导致引入组件缺失，如Row.Col undefined
      sideEffects: false,
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
            sourceMap: isSourceMap
          }),
        },
        {
          test: /\.scss$/,
          use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isSourceMap
          }, 'sass-loader'),
        },
        // {
        //   test: /\.md$/,
        //   use: [{
        //     loader: require.resolve('babel-loader'),
        //     options: {
        //       ...babelConfig,
        //       babelrc: false,
        //       configFile: false
        //     }
        //   }, {
        //     loader: require.resolve('../utils/mdLoader'),
        //     options: {
        //       ...mdLoaderOptions,
        //       mdCodeComponentPath
        //     }
        //   }]
        // }
      ]
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({
        async: isDevelopment,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        // tsconfig: projectTsconfigPath
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
        publicPath,
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
        publicPath,
        generate: (seed, files) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path
            return manifest
          }, seed)

          return {
            files: manifestFiles
          }
        }
      }),
      new WorkboxWebpackPlugin.GenerateSW({
        clientsClaim: true,
        exclude: [/\.map$/, /asset-manifest\.json$/],
        importWorkboxFrom: 'cdn',
        navigateFallback: publicPath + 'index.html',
        navigateFallbackBlacklist: [
          // Exclude URLs starting with /_, as they're likely an API call
          new RegExp('^/_'),
          // Exclude URLs containing a dot, as they're likely a resource in
          // public/ and not a SPA route
          new RegExp('/[^/]+\\.[^/]+$')
        ]
      })
    ].filter(Boolean)
  }

  const webpackConfig = merge(baseWebpackConfig, webpackExtraConfig)
  return runWebpack(webpackConfig, isDevelopment)
}
