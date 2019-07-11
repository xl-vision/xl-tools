import getEntryFile from '../utils/getEntryFile'
import getBaseWebpackConfig from '../lib/getBaseWebpackConfig'
import Webpack from 'webpack'

export type Options = {
  entry?: string
}

export default (isProduction: boolean, options: Options) => {

  const {
    entry = getEntryFile('site', ['ts', 'tsx', 'js', 'jsx'])
  } = options

  const baseConfig = getBaseWebpackConfig({
    isSourceMap: true,
    isProduction,
  })

  const extraConfig: Webpack.Configuration = {
    entry,
    output:
  }

}
