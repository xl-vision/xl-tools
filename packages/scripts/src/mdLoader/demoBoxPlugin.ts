import { getCodeBlock, Block } from './codeBlock'
import { Attacher } from 'unified'
import { Node } from 'unist'
import webpack from 'webpack'
import loaderUtils from 'loader-utils'
import getBabelConfig from '../config/getBabelConfig'
import { warn } from '../utils/logger'
import path from 'path'
import getProjectPath from '../utils/getProjectPath'
import getModuleId from './getModuleId'

const NAME = 'demobox'

const SELECTOR = require.resolve('./selector')

// 这里需要使用修改后的postcss-loader,因为原本的postcss-loader不支持属性传入plugin
const POSTCSS_LOADER = require.resolve('./postcssLoader')
const SASS_LOADER = require.resolve('./sassLoader')

const { plugins, presets } = getBabelConfig({ es: true })

plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'))

const createDemoBoxPlugin = (ctx: webpack.loader.LoaderContext) => {
  const isProduction = ctx.minimize || process.env.NODE_ENV === 'production'
  const sourceMap = ctx.sourceMap

  const {
    demoContainer,
    postcssConfig,
    cssConfig,
    demoBox,
  } = loaderUtils.getOptions(ctx)

  const regex = new RegExp(`^:::[\t\f ]*${demoContainer}[\t\f ]*(?<title>.*?)$`)

  const cssOptions = JSON.stringify({
    ...cssConfig,
    sourceMap,
    importLoaders: 1,
  })
  const css2Options = JSON.stringify({
    ...cssConfig,
    sourceMap,
    importLoaders: 2,
  })

  const sassOptions = JSON.stringify({
    sourceMap,
  })

  const stylusOptions = JSON.stringify({
    sourceMap,
  })

  const lessOptions = JSON.stringify({
    sourceMap,
  })

  const styleLoader = isProduction
    ? 'mini-css-extract-plugin/dist/loader'
    : 'style-loader'

  const getRequestPath = (lang: string, n: number) => {
    const moduleId = getModuleId(ctx.resourcePath, n)

    const postcssOptions = JSON.stringify({
      ...postcssConfig,
      sourceMap,
      moduleId,
    })

    const babelConfig = {
      plugins: plugins.concat([
        [require.resolve('./babel/scoped'), { moduleId }],
      ]),
      presets,
      babelrc: false,
      configFile: false,
    }

    const babelOptions = JSON.stringify(babelConfig)
    const tsBabelOptions = JSON.stringify({
      ...babelConfig,
      presets: babelConfig.presets.concat(
        require.resolve('@babel/preset-typescript')
      ),
    })

    const loaders: any = {
      jsx: `!babel-loader?${babelOptions}`,
      tsx: `!babel-loader?${tsBabelOptions}`,
      css: `!${styleLoader}!css-loader?${cssOptions}!${POSTCSS_LOADER}?${postcssOptions}`,
      scss: `!${styleLoader}!css-loader?${css2Options}!${POSTCSS_LOADER}?${postcssOptions}!${SASS_LOADER}?${sassOptions}`,
      sass: `!${styleLoader}!css-loader?${css2Options}!${POSTCSS_LOADER}?${postcssOptions}!${SASS_LOADER}?${sassOptions}`,
      stylus: `!${styleLoader}!css-loader?${css2Options}!${POSTCSS_LOADER}?${postcssOptions}!stylus-loader?${stylusOptions}`,
      less: `!${styleLoader}!css-loader?${css2Options}!${POSTCSS_LOADER}?${postcssOptions}!less-loader?${lessOptions}`,
    }
    let loader = loaders[lang]

    if (!loader) {
      return
    }

    loader += `!${SELECTOR}?lang=${lang}&n=${n}&demoContainer=${demoContainer}!${ctx.resourcePath}`

    const requestPath = loaderUtils.stringifyRequest(ctx, loader)

    return requestPath
  }

  const attacher: Attacher = function () {
    const Parser = this.Parser
    const process = this.processSync
    const blockTokenizers = Parser.prototype.blockTokenizers
    const blockMethods = Parser.prototype.blockMethods

    const render = (source: string) => {
      const ret = process(source).contents.toString()
      let lines = ret.split('\n')
      let i = 0
      while (i < lines.length) {
        const line = lines[i]
        if (line.trim().startsWith('return <MDXLayout')) {
          break
        }
        i++
      }
      lines = lines.slice(i + 1)
      i = 0
      while (i < lines.length) {
        const line = lines[i]
        if (line.trim().startsWith('</MDXLayout>')) {
          break
        }
        i++
      }
      lines = lines.slice(0, i)
      return lines.join('\n').trim()
    }

    blockTokenizers[NAME] = function (eat: any, value: string) {
      if (!regex.test(value)) {
        return
      }

      try {
        const codeBlock = getCodeBlock(value, demoContainer)!
        const node = {
          type: NAME,
          title: codeBlock?.title,
          desc: codeBlock?.desc,
          blocks: codeBlock?.blocks,
          mergedBlocks: codeBlock?.mergedBlocks,
          startLine: codeBlock?.startLine,
          endLine: codeBlock?.endLine,
        }

        eat(codeBlock.matchContent)(node)
      } catch (err) {
        throw new Error(`The file '${ctx.resourcePath}': ${err.message}`)
      }
    }

    blockMethods.splice(0, 0, NAME)

    return function (node: any) {
      const demoboxs = getDemoBox(node)

      if (demoBox && demoboxs.length > 0) {
        const demoBoxPath = (path.isAbsolute(demoBox)
          ? demoBox
          : getProjectPath(demoBox)
        ).replace(/\\/g, '\\\\')
        node.children.splice(0, 0, {
          type: 'import',
          value: `import DemoBox from '${demoBoxPath}'`,
        })
      }

      for (let i = 0; i < demoboxs.length; i++) {
        const demo = demoboxs[i]
        const title = demo.title as string
        const desc = demo.desc as string
        const blocks: Array<Block> = demo.blocks as Array<Block>
        const mergedBlocks = demo.mergedBlocks as Array<Block>
        const startLine = demo.startLine as Number

        for (const block of mergedBlocks) {
          let importCode = ''
          const lang = block.lang
          const requestPath = getRequestPath(lang, i)
          if (!requestPath) {
            warn(
              `file ${ctx.resourcePath}(${startLine},0): The language '${lang}' is not supported, please check it again.`
            )
            continue
          }

          if (block.lang === 'jsx' || block.lang === 'tsx') {
            importCode = `import Demo${i} from ${requestPath}`
          } else {
            importCode = `import ${requestPath}`
          }
          node.children.splice(0, 0, {
            type: 'import',
            value: importCode,
          })
        }

        const parsedBlocks = parseBlocks(blocks, render)

        const transformTitle = render(title)
        const transformDesc = render(desc)

        demo.type = 'jsx'
        demo.value = `
<DemoBox
  title={<>${transformTitle}</>}
  desc={<>${transformDesc}</>}
  blocks={${parsedBlocks}}
>
  <Demo${i}/>
</DemoBox>`
      }
      return node
    }
  }
  return attacher
}

export default createDemoBoxPlugin

const getDemoBox = (node: Node) => {
  if (!node.children) {
    return []
  }
  const arr = []
  for (const child of node.children as Array<Node>) {
    if (child.type === NAME) {
      arr.push(child)
    } else {
      arr.concat(getDemoBox(child))
    }
  }
  return arr
}

const parseBlocks = (blocks: Array<Block>, render: any) => {
  let result = '['

  for (const block of blocks) {
    const lang = block.lang
    const content = block.content.replace(/"/g, '\\"').replace(/\n/g, '\\n')
    const preview = render(`\`\`\`${lang}\n${block.content}\n\`\`\``)
    result += `{"lang": "${lang}", "content": "${content}", "preview": ${preview}},`
  }

  result += ']'

  return result
}
