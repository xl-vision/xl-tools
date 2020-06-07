import { getCodeBlock } from './codeBlock'
import webpack from 'webpack'
import loaderUtils from 'loader-utils'
import { error } from '../utils/logger'

type Info = ReturnType<typeof getCodeBlock>

const map: Map<
  string,
  {
    content: string
    infos: Array<Info>
  }
> = new Map()

const selectorLoader: webpack.loader.Loader = function (source) {
  const content = source as string
  const callback = this.async()!

  const resourcePath = this.resourcePath

  let { lang, n, demoContainer } = loaderUtils.getOptions(this)

  n = parseInt(n)

  let value = map.get(this.resourcePath)

  if (!value || value.content !== content) {
    const infos = getInfos(content, demoContainer)
    value = {
      content,
      infos,
    }
    map.set(this.resourcePath, value)
  }

  const infos = value.infos

  if (infos.length <= n) {
    const msg = `file ${resourcePath}: The ${
      n + 1
    }th code block does not exist.`
    error(msg)
    return callback(new Error(msg))
  }
  const info = infos[n]!
  const blocks = info.mergedBlocks.filter((it) => it.lang === lang)
  if (blocks.length === 0) {
    const msg = `file ${resourcePath}(${info.startLine},0): The language '${lang}' is not supported, please check it again.`
    error(msg)
    return callback(new Error(msg))
  }

  const block = blocks[0]

  callback(null, block.content)
}

export default selectorLoader

const getInfos = (content: string, demoContainer: string) => {
  const infos: Array<ReturnType<typeof getCodeBlock>> = []

  while (true) {
    const info = getCodeBlock(content, demoContainer)

    if (!info) {
      break
    }

    infos.push(info)

    content = info.nextContent
  }

  return infos
}
