import fs from 'fs-extra'
import getProjectPath from "./getProjectPath";

export default (filePath: string, exts: string[]) => {

  for (let ext of exts) {
    const file = getProjectPath(`${filePath}/index.${ext}`)
    if (fs.existsSync(file)) {
      return file
    }
  }

  throw new Error('Can not find matched file.')
}
