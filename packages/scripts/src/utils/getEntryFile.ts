import fs from 'fs-extra'
import getProjectPath from './getProjectPath'
import path from 'path'

export default (dir: string, exts: Array<string>) => {
  dir = path.isAbsolute(dir) ? dir : getProjectPath(dir)
  for (let ext of exts) {
    const file = path.join(dir, `index.${ext}`)
    if (fs.existsSync(file)) {
      return file
    }
  }

  return ''
}
