import getHash from '../utils/getHash'

export default (resourcePath: string, n: number) => {
  return `data-xl-${getHash(resourcePath)}-${n}`
}