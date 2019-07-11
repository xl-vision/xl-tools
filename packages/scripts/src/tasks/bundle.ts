import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import {toCamel} from '../utils/stringUtils'
import getEntryFile from '../utils/getEntryFile'
import merge from 'webpack-merge'
import runWebpack from "../utils/runWebpack";
import compileScss from "../lib/compileScss";

export type Options = {
  libraryName?: string
  entry?: string
  style?: string
}

type BuildOptions = Required<Options>

export default (options: Options) => {
  const {
    libraryName = toCamel(require(getProjectPath('package.json')).name),
    entry = getEntryFile('src', ['js', 'jsx', 'ts', 'tsx']),
    style = getEntryFile('src/style', ['scss']),
    ...others
  } = options

  if (!entry) {
    throw new Error('No entry file')
  }

  if (!style) {
    throw new Error('No style entry file')
  }

  const promise1 = build(false, {
    libraryName,
    entry,
    style,
    ...others
  })
  const promise2 = build(true, {
    libraryName,
    entry,
    style,
    ...others
  })
  return Promise.all([promise1, promise2])
}

const build = (isProduction: boolean, options: BuildOptions) => {
  const {
    libraryName,
    entry,
    style
  } = options
  const config = getBaseWebpackConfig({
    isProduction,
    isSourceMap: true
  })


  const extraConfig: Webpack.Configuration = {
    entry,
    output: {
      libraryTarget: 'umd',
      umdNamedDefine: true,
      library: libraryName,
      path: getProjectPath('dist'),
      pathinfo: !isProduction,
      filename: `index${isProduction ? '.min' : ''}.js`
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

  const promise1 = runWebpack(allConfig)

  const promise2 = compileScss(style, 'dist', {
    rename: file => {
      file.basename = `index${isProduction ? '.min' : ''}.css`
      return file
    }
  })

  return Promise.all([promise2, promise1])

}
