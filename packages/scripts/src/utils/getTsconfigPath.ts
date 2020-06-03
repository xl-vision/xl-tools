import getProjectPath from './getProjectPath'
import fs from 'fs-extra'
import { error } from './logger'

export default (tsConfig?: string) => {
  if (!tsConfig) {
    return error(
      `The tsconfig file is not exist, please make sure you have created it.`
    )
  }

  const tsConfigFilePath = getProjectPath(tsConfig)

  // 判断tsconfig是否存在
  if (!fs.existsSync(tsConfigFilePath) || !fs.statSync(tsConfigFilePath).isFile()) {
    return error(
      `The tsconfig file '${tsConfig}' does not exist, please make sure you have created it.`
    )
  }

  return tsConfigFilePath
}
