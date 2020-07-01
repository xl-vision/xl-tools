import { default as sl } from 'sass-loader'
import loaderUtils from 'loader-utils'
import webpack from 'webpack'

const sassLoader: webpack.loader.Loader = function (content, map) {
  let options = loaderUtils.getOptions(this)

  const config = {
    implementation: require('dart-sass'),
    sassOptions: {
      fiber: require('fibers'),
    },
  }

  options = {
    ...config,
    ...options,
  }

  return sl.call({ ...this, query: options }, content, map)
}

export default sassLoader
