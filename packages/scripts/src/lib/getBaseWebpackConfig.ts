import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CleanUpStatsPlugin from '../utils/CleanUpStatsPlugin'
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin'
import getProjectPath from '../utils/getProjectPath';
import fs from 'fs-extra';

export type Options = {
  dev: boolean
  tsCheck: boolean
  tsConfigFile?: string
  tsCheckAsync: boolean
}

export default (options: Options) => {
  const {
    dev,
    tsCheck,
    tsCheckAsync,
    tsConfigFile
  } = options

  if (tsCheck) {
    if (!tsConfigFile) {
      throw new Error("Please provide 'tsconfigFile'.")
    }
    const tsConfigFilePath = getProjectPath(tsConfigFile)
    if (!fs.existsSync(tsConfigFilePath)) {
      throw new Error('Could not find tsconfig file: ' + tsConfigFile)
    }
  }

  const config: webpack.Configuration = {
    mode: dev ? 'development' : 'production',
    bail: !dev,
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        react: require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react-native': 'react-native-web',
      }
    },
    optimization: {
      minimize: !dev,
      concatenateModules: !dev,
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
          sourceMap: true
        })
      ]
    },
    module: {
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
      ]
    },
    plugins: [
      !dev &&
      new webpack.LoaderOptionsPlugin({
        minimize: true
      }),
      tsCheck &&
      new ForkTsCheckerWebpackPlugin({
        async: tsCheckAsync,
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
