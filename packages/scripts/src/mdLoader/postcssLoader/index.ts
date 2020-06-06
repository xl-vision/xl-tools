import { default as pcl } from 'postcss-loader'
import loaderUtils from 'loader-utils'
import webpack from 'webpack'
import getPostcssConfig from '../../config/getPostcssConfig'
import scoped from './scoped'
import path from 'path'
import postcssrc from 'postcss-load-config'


const postcssLoader: webpack.loader.Loader = function (content, map) {

  let options = loaderUtils.getOptions(this)
  const sourceMap = options.sourceMap
  const file = this.resourcePath

  const postcssConfigFile = options.postcssConfigFile
  delete options.postcssConfigFile
  const moduleId = options.moduleId
  delete options.moduleId

  const config = getPostcssConfig(postcssConfigFile)

  options = { ...options, ...config }

  const length = Object.keys(options)
    .filter((option) => {
      switch (option) {
        // case 'exec':
        case 'ident':
        case 'config':
        case 'sourceMap':
          return
        default:
          return option
      }
    })
    .length

  // 当options中配置了plugins时会不加载配置文件，所以我们需要手动加载配置文件
  if (!length) {
    const rc: any = {
      path: path.dirname(file),
      ctx: {
        file: {
          extname: path.extname(file),
          dirname: path.dirname(file),
          basename: path.basename(file)
        },
        options: {}
      }
    }

    if (options.config) {
      if (options.config.path) {
        rc.path = path.resolve(options.config.path)
      }

      if (options.config.ctx) {
        rc.ctx.options = options.config.ctx
      }
    }

    rc.ctx.webpack = this
    options = postcssrc.sync(rc.ctx, rc.path)
  }

  const plugin = scoped(moduleId)

  options.plugins = (options.plugins || []).concat(plugin)
  // souceMap不能遗失
  options.sourceMap = sourceMap

  // 设置到ctx中，使得postcss-loader可以读取到配置
  // this.query = options

  return pcl.call({ ...this, query: options }, content, map)
}

export default postcssLoader
