import webpack from 'webpack'
import TerserPlugin from 'terser-webpack-plugin'
import CaseSensitivePathsPlugin from 'case-sensitive-paths-webpack-plugin'
import CleanUpStatsPlugin from '../utils/CleanUpStatsPlugin'

export type Options  = {
  production: boolean,
  sourceMap: boolean
}

module.exports = (options: Options) => {

  const {production, sourceMap} = options

  const config: webpack.Configuration = {
    mode: production ? 'production' : 'development',
    bail: production,
    devtool: sourceMap ? (production ? 'source-map' : 'cheap-module-source-map') : false,
    optimization: {
      minimize: production,
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
          sourceMap
        })
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.scss', '.md', '.mdx'],
    },
    module: {
      rules: [
        // Disable require.ensure as it's not a standard language feature.
        { parser: { requireEnsure: false } },
        {
          test: /\.(js|jsx|ts|tsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/
        }
      ]
    },
    plugins: [
      production && new webpack.optimize.ModuleConcatenationPlugin(),
      production && new webpack.LoaderOptionsPlugin({
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