import mustache from 'mustache'
import fs from 'fs-extra'
import path from 'path'
import isbinaryfile from 'isbinaryfile'

function writeTpl<T extends {}>(data: T, from: string, to: string){
  const files = getFiles(from)
  for (let file of files) {
    const dest = path.join(to, path.relative(from, file))

    fs.ensureFileSync(dest)
    if(isbinaryfile.isBinaryFileSync(file)) {
      fs.copyFileSync(file, dest)
    } else {
      const rendered = mustache.render(fs.readFileSync(file, {encoding: 'utf-8'}), data)
      fs.writeFileSync(dest, rendered)
    }
  }
}

function getFiles (filePath: string): string[] {
  const ret = []
  const files = fs.readdirSync(filePath).map(it => path.join(filePath, it))
  for (let file of files) {
    if(fs.lstatSync(file).isDirectory()) {
      ret.push(...getFiles(file))
    } else {
      ret.push(file)
    }
  }
  return ret
}

export default writeTpl
