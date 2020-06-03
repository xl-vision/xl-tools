import fs from 'fs-extra'
import getProjectPath from './getProjectPath'
import path from 'path'
import { error } from './logger'

export default (filePath: string, exts: Array<string>) => {
  const fulllFilePath = path.isAbsolute(filePath)
    ? filePath
    : getProjectPath(filePath)

  if (fs.existsSync(fulllFilePath) && fs.statSync(fulllFilePath).isFile()) {
    return fulllFilePath
  }

  for (let ext of exts) {
    const file = path.join(fulllFilePath, `index.${ext}`)
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      return file
    }
  }

  return error(
    `The entry file '${filePath}' does not exist, please make sure you provide it correctly.`
  )
}
