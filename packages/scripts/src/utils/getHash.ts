import hash from 'hash-sum'

const cache = Object.create(null)

export default (filePath: string) => {
  return cache[filePath] || (cache[filePath] = hash(filePath))
}
