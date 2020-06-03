import getProjectPath from '../utils/getProjectPath'
import fs from 'fs-extra'
import { error } from '../utils/logger'

export default (postcssConfig?: string) => {
  if (!postcssConfig) {
    return {}
  }

  const postcssConfigFile = getProjectPath(postcssConfig)
  if (!fs.existsSync(postcssConfigFile) || !fs.statSync(postcssConfigFile).isFile()) {
    return error(
      `The postcss config file '${postcssConfigFile}' does not exist, please make sure you have created it.`
    )
  }

  const postcssObj = require(postcssConfigFile)

  if (typeof postcssObj === 'function') {
    return postcssObj()
  }

  if (typeof postcssObj === 'object') {
    return postcssObj
  }

  return error(
    `The content of file '${postcssConfigFile}' should be function or object.`
  )
}
