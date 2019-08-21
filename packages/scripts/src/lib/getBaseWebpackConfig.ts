import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CleanUpStatsPlugin from '../utils/CleanUpStatsPlugin'
import getBabelConfig from './getBabelConfig'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'

export type Options = {
  isProduction: boolean
  isSourceMap: boolean
  useTsCheckerPlugin: boolean
  tsConfigFile?: string
}

export default (options: Options) => {
  const {
    isProduction,
    isSourceMap,
    useTsCheckerPlugin,
    tsConfigFile
  } = options

  if (useTsCheckerPlugin && !tsConfigFile) {
    throw new Error("Please provide 'tsConfigFile'.")
  }

  const config: webpack.Configuration = {
    mode: isProduction ? 'production' : 'development',
    bail: isProduction,
    devtool: isSourceMap
      ? isProduction
        ? 'source-map'
        : 'cheap-module-source-map'
      : false,
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-native': 'react-native-web',
      }
    },
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
        }
      ]
    },
    plugins: [
      isProduction &&
      new webpack.LoaderOptionsPlugin({
        minimize: true
      }),
      !isProduction &&
      useTsCheckerPlugin &&
      new ForkTsCheckerWebpackPlugin({
        async: !isProduction,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        tsconfig: tsConfigFile
        // silent: true
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
