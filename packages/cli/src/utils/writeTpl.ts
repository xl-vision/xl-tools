import ejs from 'ejs'
import fs from 'fs-extra'
import path from 'path'
import isbinaryfile from 'isbinaryfile'

function writeTpl<T extends {}>(from: string, to: string, data: T) {
  const files = getFiles(from)
  for (let file of files) {
    let dest = path.join(to, path.relative(from, file))

    if(file === from) {
      dest = path.join(dest, path.relative(path.dirname(from), from))
    }

    fs.ensureFileSync(dest)
    if (isbinaryfile.isBinaryFileSync(file)) {
      fs.copyFileSync(file, dest)
    } else {
      const rendered = ejs.render(fs.readFileSync(file, {encoding: 'utf-8'}), data)
      fs.writeFileSync(dest, rendered)
    }
  }
}

function getFiles(filePath: string): string[] {
  if (!fs.lstatSync(filePath).isDirectory()) {
    return [filePath]
  }
  const ret = []
  const files = fs.readdirSync(filePath).map(it => path.join(filePath, it))
  for (let file of files) {
    ret.push(...getFiles(file))
  }
  return ret
}

export default writeTpl
