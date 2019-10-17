import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'
import getProjectPath from '../utils/getProjectPath'
import merge from 'webpack-merge'
import runWebpack from '../utils/runWebpack'
import compileScss from '../lib/compileScss'
import getBabelConfig from '../lib/getBabelConfig'

export type Options = {
  entry: string,
  styleEntry: string,
  dest: string
  libraryName: string,
  tsConfigFile?: string
}

export default async (
  options: Options
) => {
  await build({ ...options, dev: true })
  await build({ ...options, dev: false })
}

const build = (
  options: Options & {
    dev: boolean
  }
) => {
  const {
    libraryName,
    entry,
    styleEntry,
    dev,
    dest,
    tsConfigFile
  } = options

  // 两次生成只需要做一次tscheck就好了
  const config = getBaseWebpackConfig({
    dev,
    // 判断是否需要启用ts checker
    tsCheck: dev,
    tsConfigFile,
    tsCheckAsync: false
  })

  const extraConfig: Webpack.Configuration = {
    entry: getProjectPath(entry),
    output: {
      libraryTarget: 'umd',
      umdNamedDefine: true,
      library: libraryName,
      path: getProjectPath(dest),
      pathinfo: dev,
      filename: `index${dev ? '' : '.min'}.js`
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
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/,
          options: {
            babelrc: false,
            configFile: false,
            ...getBabelConfig({
              target: 'dist',
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
              target: 'dist',
              isTypescript: true
            })
          }
        }
      ]
    }
  }

  const allConfig = merge(config, extraConfig)

  const promise1 = runWebpack(allConfig)

  const promise2 = compileScss(styleEntry, dest, {
    beautify: dev,
    rename: file => {
      file.basename = `index${dev ? '' : '.min'}`
      return file
    }
  })

  return Promise.all([promise2, promise1])
}
