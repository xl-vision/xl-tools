const path = require('path')
const getBaseWebpackConfig = require('../config/getBaseWebpackConfig')
const merge = require('webpack-merge')
const runWebpack = require('../utils/runWebpack')

module.exports = ({
  isProduction,
  input,
  output,
  babelConfig,
  tsconfigPath,
  bannerMessage
}) => {
  const isSourceMap = true
  const baseWebpackConfig = getBaseWebpackConfig({
    isProduction,
    input,
    output,
    babelConfig,
    tsconfigPath,
    isSourceMap,
    bannerMessage
  })
  const filename = path.basename(input)
  const webpackExtraConfig = {
    output: {
      filename: `${filename}.${isProduction ? 'production' : 'development'}.js`
    },
    externals: {
      react: {
        commonjs: 'react',
        commonjs2: 'react',
        amd: 'react',
        root: 'React'
      },
      'react-dom': {
        commonjs: 'react-dom',
        commonjs2: 'react-dom',
        amd: 'react-dom',
        root: 'ReactDom'
      }
    }
  }

  const webpackConfig = merge.strategy(baseWebpackConfig, webpackExtraConfig)
  return runWebpack(webpackConfig, false)
}
