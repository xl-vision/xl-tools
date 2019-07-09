import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import {toCamel} from '../utils/stringUtils'
import getEntryFile from '../utils/getEntryFile'
import merge from 'webpack-merge'
import runWebpack from "../utils/runWebpack";

export type Options = {
  libraryName?: string
}

export default (options: Options) => {
  const {
    libraryName = toCamel(require(getProjectPath('package.json')).name),
    ...others
  } = options

  const promise1 = build(false, {
    libraryName,
    ...others
  })
  const promise2 = build(true, {
    libraryName,
    ...others
  })
  return Promise.all([promise1, promise2])
}

const build = (isProduction: boolean, options: Options) => {
  const {
    libraryName
  } = options
  const config = getBaseWebpackConfig({
    isProduction,
    isSourceMap: true
  })

  const entry = getEntryFile('src', ['js', 'jsx', 'ts', 'tsx'])

  if (!entry) {
    throw new Error('No entry file')
  }

  const extraConfig: Webpack.Configuration = {
    entry,
    output: {
      libraryTarget: 'umd',
      umdNamedDefine: true,
      library: libraryName,
      path: getProjectPath('dist'),
      pathinfo: !isProduction
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

  const allConfig = merge(config, extraConfig)

  return runWebpack(allConfig)

}
