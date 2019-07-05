import path from 'path'

export default (file: string) => {
  if(path.isAbsolute(file)) {
    return file
  }
  return path.join(process.cwd(), file)
}