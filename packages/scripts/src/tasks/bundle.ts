import { SOURCE_DIR, DIST_DIR } from './entry'
import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import { toCamel } from '../utils/stringUtils'
import getEntryFile from '../utils/getEntryFile'
import merge from 'webpack-merge'
import runWebpack from '../utils/runWebpack'
import compileScss from '../lib/compileScss'
import checkTsCondition from '../utils/checkTsCondition'

export type Options = {
  libraryName?: string
}

type BuildOptions = Required<Options>

export default (options: Options) => {
  const {
    // 自定义库名称，默认为package.json中的name字段驼峰化
    libraryName = toCamel(require(getProjectPath('package.json')).name),
    ...others
  } = options

  const promise1 = build(false, true, {
    libraryName,
    ...others
  })
  const promise2 = build(true, false, {
    libraryName,
    ...others
  })
  return Promise.all([promise1, promise2])
}

const tsSrc = [`${SOURCE_DIR}/**/*.ts?(x)`, `!${SOURCE_DIR}/**/{test,doc}/**`]
// tsconfig.json
const tsConfigFile = getProjectPath('tsconfig.json')
const hasTsCondition = checkTsCondition(tsSrc, tsConfigFile)

const build = (
  isProduction: boolean,
  needCheck: boolean,
  options: BuildOptions
) => {
  const { libraryName } = options

  // 样式文件入口
  const style = getEntryFile(SOURCE_DIR, ['scss'])

  // js文件入口
  const entry = getEntryFile(SOURCE_DIR, ['js', 'jsx', 'ts', 'tsx'])

  const config = getBaseWebpackConfig({
    isProduction,
    isSourceMap: true,
    // 判断是否需要启用ts checker
    useTsCheckerPlugin: needCheck && hasTsCondition,
    tsConfigFile
  })

  const extraConfig: Webpack.Configuration = {
    entry,
    output: {
      libraryTarget: 'umd',
      umdNamedDefine: true,
      library: libraryName,
      path: getProjectPath(DIST_DIR),
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

  const promise2 = compileScss(style, DIST_DIR, {
    beautify: !isProduction,
    rename: file => {
      file.basename = `index${isProduction ? '.min' : ''}`
      return file
    }
  })

  return Promise.all([promise2, promise1])
}
