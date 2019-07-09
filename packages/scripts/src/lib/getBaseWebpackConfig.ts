import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CleanUpStatsPlugin from '../utils/CleanUpStatsPlugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import getBabelConfig from "./getBabelConfig";

export type Options = {
  isProduction: boolean,
  isSourceMap: boolean
}

export default (options: Options) => {

  const {isProduction, isSourceMap} = options

  const getStyleLoaders = (cssOptions: any, preProcessor?: string) => {
    const loaders = [
      isProduction ? {
        loader: MiniCssExtractPlugin.loader,
        options: {}
      } : require.resolve('style-loader'),
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

  const config: webpack.Configuration = {
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,
    devtool: isSourceMap ? (isProduction ? 'source-map' : 'cheap-module-source-map') : false,
    optimization: {
      minimize: isProduction,
      concatenateModules: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            parse: {
              ecma: 8
            },
            compress: {
              warnings: false,
              comparisons: false,
              inline: 2
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
        })
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.scss', '.md', '.mdx'],
    },
    module: {
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        {parser: {requireEnsure: false}},
        {
          test: /\.(js|jsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/,
          options: {
            babelrc: false,
            configFile: false,
            ...getBabelConfig({
              target: 'site',
              isTypescript: false
            })
          }
        },
        {
          test: /\.(ts|tsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/,
          options: {
            babelrc: false,
            configFile: false,
            ...getBabelConfig({
              target: 'site',
              isTypescript: true
            })
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
          test: /\.scss/,
          use: getStyleLoaders({
            importLoaders: 2,
            sourceMap: isProduction && isSourceMap
          }, 'sass-loader'),
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
    },
    plugins: [
      isProduction && new webpack.LoaderOptionsPlugin({
        minimize: true
      }),
      new CaseSensitivePathsPlugin(),
      new CleanUpStatsPlugin(),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how Webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
    ].filter(Boolean) as any[]
  }

  return config
}
