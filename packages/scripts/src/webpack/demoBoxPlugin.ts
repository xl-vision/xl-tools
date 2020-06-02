import { loaderUtils } from 'loader-utils'
import { Attacher } from 'unified'
import { Node } from 'unist'
import * as babel from './node_modules/@babel/core'
import getBabelConfig from '../config/getBabelConfig'
import webpack from 'webpack'
import getHash from '../utils/getHash'
import path from 'path'

const selectorPath = path.join(__dirname, 'selector.js')


const name = 'demobox'

const getDemoBox = (node: Node) => {
  if (!node.children) {
    return []
  }
  const arr = []
  for (const child of node.children as Array<Node>) {
    if (child.type === name) {
      arr.push(child)
    } else {
      arr.concat(getDemoBox(child))
    }
  }
  return arr
}

export type Options = {
  demoContainer: string
}

const createDemoBoxPlugin = (
  ctx: webpack.loader.LoaderContext,
  options: Options
) => {
  const { demoContainer } = options

  const hash = getHash(ctx.resourcePath)

  const regex = new RegExp(`^:::[\t\f ]*${demoContainer}[\t\f ]*(?<title>.*?)$`)

  const getLoaderString = (moduleId: string, block: Block) => {
    const path = `!${selectorPath}?moduleId=${moduleId}&lang=${block.langurage}&content=${block.content}!`
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

    blockTokenizers[name] = function (eat: any, value: string) {
      if (!value.startsWith(':::')) {
        return
      }
      const container = []
      const lines = value.split('\n')
      const m = regex.exec(lines[0])
      if (!m) {
        return
      }

      const title = m.groups!.title

      let depth = 0
      for (const line of lines) {
        if (/^:::[\t\f ]*\S+.*$/.exec(line)) {
          depth++
        } else if (line === ':::') {
          depth--
        }

        container.push(line)

        if (depth !== 1) {
          break
        }
      }

      if (depth !== 0) {
        return
      }

      const body = container.slice(1, container.length - 1)

      let i = 0
      for (; i < body.length; i++) {
        const line = body[i]
        if (line.startsWith('```')) {
          break
        }
      }

      const desc = render(body.slice(0, i).join('\n'))

      const blocks = getBlocks(body.slice(i))

      const exit = this.enterBlock()

      const add = eat(container.join('\n'))

      const node = {
        type: name,
        title: render(title),
        desc,
        blocks,
      }

      add(node)
      exit()
    }

    blockMethods.splice(0, 0, name)

    return function (node: Node) {
      const demoboxs = getDemoBox(node)
      for (let i = 0; i < demoboxs.length; i++) {
        const moduleId = 'demo-' + hash
        const demo = demoboxs[i]
        const title = demo.title as string
        const desc = demo.desc as string
        const blocks: Array<any> = demo.blocks as Array<Block>
        const mergedBlocks = mergeBlocks(blocks)
        const fnName = `DEMO_${i}`

        const transformCode = babel.transformSync(`${code}`, {
          babelrc: false,
          configFile: false,
          ...getBabelConfig({
            target: 'site',
            isTypescript: false,
            // import转require
            isEs: false,
          }),
        }).code

        const code2 = `export const ${fnName} = function() {
    const exports = {}
    ${transformCode}
    return exports['default'](...arguments)
  }`

        let j = 0
        for (; j < node.children.length; j++) {
          const child = node.children[j]
          if (child.type !== 'import' && child.type !== 'export') {
            break
          }
        }

        node.children.splice(j, 0, {
          type: 'export',
          value: code2,
        })

        const escapeCode =
          '`' + code.replace(/`/g, '`').replace(/([\$\{\}`])/g, "${'$1'}") + '`'

        demo.type = 'jsx'
        demo.value = `<DemoBox title={${
          title || `''`
        }} desc={<>${desc}</>} code={${escapeCode}} preview={<${fnName}/>}>${preview}</DemoBox>`
      }
      return node
    }
  }
}

export default createDemoBoxPlugin


