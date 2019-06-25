const path = require('path')
const getBaseWebpackConfig = require('../config/getBaseWebpackConfig')
const merge = require('webpack-merge')
const runWebpack = require('../utils/runWebpack')

module.exports = ({
  basename,
  isProduction,
  input,
  output,
  babelConfig,
  bannerMessage
}) => {
  const isSourceMap = true
  if (!path.isAbsolute(input)) {
    input = path.join(process.cwd(), input)
  }
  if (!path.isAbsolute(output)) {
    output = path.join(process.cwd(), output)
  }
  const baseWebpackConfig = getBaseWebpackConfig({
    isProduction,
    input,
    output,
    babelConfig,
    isSourceMap,
    bannerMessage
  })

  const webpackExtraConfig = {
    output: {
      basename: `${basename}.${isProduction ? 'min' : ''}.js`
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
        root: 'ReactDOM'
      }
    }
  }

  const webpackConfig = merge(baseWebpackConfig, webpackExtraConfig)
  return runWebpack(webpackConfig, false)
}
