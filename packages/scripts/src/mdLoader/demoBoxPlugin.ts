import { getCodeBlock, Block } from './codeBlock'
import { Attacher } from 'unified'
import { Node } from 'unist'
import webpack from 'webpack'
import loaderUtils from 'loader-utils'
import getBabelConfig from '../config/getBabelConfig'
import { warn } from '../utils/logger'
import path from 'path'
import getProjectPath from '../utils/getProjectPath'

const NAME = 'demobox'

const SELECTOR = path.join(__dirname, 'selector.js')

const { plugins, presets } = getBabelConfig({ es: true })

plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'))

const babelOptions = JSON.stringify({
  plugins,
  presets,
  babelrc: false,
  configFile: false,
})
const tsBabelOptions = JSON.stringify({
  plugins,
  presets: presets.concat(require.resolve('@babel/preset-typescript')),
  babelrc: false,
  configFile: false,
})

const createDemoBoxPlugin = (ctx: webpack.loader.LoaderContext) => {
  const isProduction = ctx.minimize || process.env.NODE_ENV === 'production'
  const { demoContainer, postcssConfig, cssConfig, demoBox } = loaderUtils.getOptions(ctx)
  const sourceMap = ctx.sourceMap

  const postcssOptions = JSON.stringify({ ...postcssConfig, sourceMap })
  const cssOptions = JSON.stringify(cssConfig)

  const styleLoader = isProduction ? 'mini-css-extract-plugin/dist/loader' : 'style-loader'

  const loaders: any = {
    jsx: `!babel-loader?${babelOptions}`,
    tsx: `!babel-loader?${tsBabelOptions}`,
    css: `!${styleLoader}!css-loader?${cssOptions}!postcss-loader?${postcssOptions}`,
    scss: `!${styleLoader}!css-loader?${cssOptions}!postcss-loader?${postcssOptions}!sass-loader`,
    sass: `!${styleLoader}!css-loader?${cssOptions}!postcss-loader?${postcssOptions}!sass-loader`,
    stylus: `!${styleLoader}!css-loader?${cssOptions}!postcss-loader?${postcssOptions}!stylus-loader`,
    less: `!${styleLoader}!css-loader?${cssOptions}!postcss-loader?${postcssOptions}!less-loader`,
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
      return lines.join('\n')
    }

    blockTokenizers[NAME] = function (eat: any, value: string) {
      if (!value.startsWith(':::')) {
        return
      }

      const codeBlock = getCodeBlock(value, demoContainer)!

      const exit = this.enterBlock()

      const add = eat(codeBlock.matchContent)

      const node = {
        type: NAME,
        title: codeBlock?.title,
        desc: codeBlock?.desc,
        blocks: codeBlock?.blocks,
        mergedBlocks: codeBlock?.mergedBlocks,
        startLine: codeBlock?.startLine,
        endLine: codeBlock?.endLine,
      }

      add(node)
      exit()
    }

    blockMethods.splice(0, 0, NAME)

    return function (node: any) {
      const demoboxs = getDemoBox(node)

      if (demoBox && demoboxs.length > 0) {
        const demoBoxPath = (path.isAbsolute(demoBox) ? demoBox : getProjectPath(demoBox)).replace(/\\/g, '\\\\')
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
          const loader = loaders[lang]
          if (!loader) {
            warn(
              `file ${ctx.resourcePath}(${startLine},0): The language '${lang}' is not supported, please check it again.`
            )
            continue
          }
          const requirePath = loaderUtils.stringifyRequest(
            ctx,
            `${loader}!${SELECTOR}?lang=${lang}&n=${i}&demoContainer=${demoContainer}!${ctx.resourcePath}`
          )

          if (block.lang === 'jsx' || block.lang === 'tsx') {
            importCode = `import Demo${i} from ${requirePath}`
          } else {
            importCode = `import ${requirePath}`
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
    const lang = block.lang;
    const content = block.content.replace(/"/g, "\\\"").replace(/\n/g, "\\n");
    const preview = render(`\`\`\`${lang}\n${block.content}\n\`\`\``);
    result += `{"lang": "${lang}", "content": "${content}", "preview": <>${preview}</>},`;
  }

  result += ']'

  return result
}