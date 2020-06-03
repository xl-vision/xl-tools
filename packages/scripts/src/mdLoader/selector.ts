import { rewriteScript, rewriteStyle } from './rewrite'
import { getCodeBlock } from './codeBlock'
import webpack from 'webpack'
import loaderUtils from 'loader-utils'
import getHash from '../utils/getHash'
import { error } from '../utils/logger'

const selectorLoader: webpack.loader.Loader = function (source) {
  const callback = this.async()!

  const resourcePath = this.resourcePath
  const hash = getHash(this.resourcePath)

  let { lang, n, demoContainer } = loaderUtils.getOptions(this)

  n = parseInt(n)

  const info = getNBlocks(n, source as string, demoContainer)

  if (!info) {
    const msg = `file ${resourcePath}: The ${n+1}th code block does not exist.`
    error(msg)
    return callback(new Error(msg))
  }
  const blocks = info.mergedBlocks.filter(it => it.lang === lang)
  if (blocks.length === 0) {
    const msg = `file ${resourcePath}(${info.startLine},0): The language '${lang}' is not supported, please check it again.`
    error(msg)
    return callback(new Error(msg))
  }

  const block = blocks[0]

  let result = ''

  if (lang === 'tsx' || lang === 'jsx') {
    result = rewriteScript(block.content, `data-v-${hash}-${n}`)
  } else {
    result = rewriteStyle(block.content, `data-v-${hash}-${n}`)
  }

  callback(null, result)
}

export default selectorLoader

const getNBlocks = (n: number, content: string, demoContainer: string) => {
  while (true) {
    const info = getCodeBlock(content, demoContainer)

    if (!info) {
      return
    }

    if (n === 0) {
      return info
    }
    content = info.nextContent
    n--
  }
}
