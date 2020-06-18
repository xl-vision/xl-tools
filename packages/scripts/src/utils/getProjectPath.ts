import path from 'path'

export default (file?: string) => {
  if (!file) {
    return process.cwd()
  }
  if (path.isAbsolute(file)) {
    return file
  }
  return path.join(process.cwd(), file)
}