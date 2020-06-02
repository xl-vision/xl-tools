import { rewriteScript, rewriteStyle } from './rewrite'
import { warn } from './../utils/logger'
import { getCodeBlock, Block } from './codeBlock'
import webpack from 'webpack'
import loaderUtils from 'loader-utils'
import getHash from '../utils/getHash'
import { error } from '../utils/logger'

type Info = ReturnType<typeof getCodeBlock>

type BlocksMap = {
  [resourcepath: string]: Array<Info>
}

const blocksMap: BlocksMap = {}

const selectorLoader: webpack.loader.Loader = function (source) {
  const callback = this.async()!

  const resourcePath = this.resourcePath
  const hash = getHash(this.resourcePath)

  const { lang, n, demoContainer } = loaderUtils.getOptions(this)

  let blocksArray = (blocksMap[resourcePath] =
    blocksMap[resourcePath] ||
    getAllMergedBlocks(source as string, demoContainer))

  if (n >= blocksArray.length) {
    const msg = `file ${resourcePath}: The code blocks length(${blocksArray.length}) does not macth n(${n}).`
    error(msg)
    return callback(new Error(msg))
  }
  const info = blocksArray[n]!
  const block = info.mergedBlocks[lang]
  if (!block) {
    warn(
      `file ${resourcePath}(${info.startLine},0): The language '${lang}' is not supported, please check it again.`
    )
  }

  let result = ''

  if (lang === 'tsx' || lang === 'jsx') {
    result = rewriteScript(block.content, hash)
  } else {
    result = rewriteStyle(block.content, hash)
  }

  callback(null, result)
}

export default selectorLoader

const getAllMergedBlocks = (content: string, demoContainer: string) => {
  const blocksArray: Array<Info> = []
  while (true) {
    const info = getCodeBlock(content, demoContainer)

    if (!info) {
      break
    }

    content = info.nextContent
    blocksArray.push(info)
  }

  return blocksArray
}
