import chalk from 'chalk'
import getProjectPath from '../utils/getProjectPath'
import fs from 'fs-extra'

export default (tsConfig: string) => {
  if (!tsConfig) {
    const error = `The tsconfig file is not exist, please make sure you have created it.`
    console.error(chalk.red(error))
    throw new Error(error)
  }

  const tsConfigFilePath = getProjectPath(tsConfig)

  // 判断tsconfig是否存在
  if (!fs.existsSync(tsConfigFilePath)) {
    const error = `The tsconfig file '${tsConfig}' does not exist, please make sure you have created it.`
    console.error(chalk.red(error))
    throw new Error(error)
  }

  return tsConfigFilePath
}
