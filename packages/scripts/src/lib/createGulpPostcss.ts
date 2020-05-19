import postcss from 'gulp-postcss'
import getProjectPath from '../utils/getProjectPath'
import fs from 'fs-extra'
import chalk from 'chalk'

export default (postcssConfig?: string) => {
  if (!postcssConfig) {
    return postcss()
  }

  const postcssConfigFile = getProjectPath(postcssConfig)
  if (!fs.existsSync(postcssConfigFile)) {
    const error = `The postcss config file '${postcssConfigFile}' does not exist, please make sure you have created it.`
    console.error(chalk.red(error))
    throw new Error(error)
  }

  const postcssObj = require(postcssConfigFile)

  if (typeof postcssObj === 'function') {
    return postcss(postcssObj)
  }

  if (typeof postcssObj === 'object') {
    return postcss(() => postcssObj)
  }

  const error = `The content of file '${postcssConfigFile}' should be function or object.`
  console.error(chalk.red(error))
  throw new Error(error)
}
