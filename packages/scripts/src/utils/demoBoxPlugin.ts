import { Attacher } from 'unified'
import * as babel from '@babel/core'
import getBabelConfig from '../lib/getBabelConfig';

const regex = /^:::[\t\f ]*demo[\t\f ]*(?<title>.*?)$/
const name = 'demobox'

const getDemoBox = (node: any) => {
  if (!node.children) {
    return []
  }
  const arr = []
  for (const child of node.children) {
    if (child.type === name) {
      arr.push(child)
    } else {
      arr.concat(getDemoBox(child))
    }
  }
  return arr
}

const attacher: Attacher = function () {
  const Parser = this.Parser
  const process = this.processSync
  const blockTokenizers = Parser.prototype.blockTokenizers
  const blockMethods = Parser.prototype.blockMethods

  const render = (source: string) => {
    const ret = process(source).contents.toString()
    let lines = ret.split('\n')
    let i = 0;
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
    if (!value.startsWith(":::")) {
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

    const desc = render(body.slice(0, i).filter(it => it.trim() !== '').join('\n'))

    let j = i + 1
    for (; j < body.length; j++) {
      const line = body[j]
      if (line.startsWith('```')) {
        break
      }
    }

    const code = body.slice(i + 1, j).join('\n')

    const preview = render(body.slice(i, j + 1).join('\n'))

    const exit = this.enterBlock()

    const add = eat(container.join('\n'))

    const node = {
      type: name,
      title: render(title),
      desc,
      code,
      preview
    }

    add(node)
    exit()
  }

  blockMethods.splice(0, 0, name)

  return function (node: any) {
    const demoboxs = getDemoBox(node)
    for (let i = 0; i < demoboxs.length; i++) {
      const demo = demoboxs[i]
      const title = demo.title
      const desc = demo.desc
      const code: string = demo.code
      const preview = demo.preview
      const fnName = `DEMO_${i}`
      
      const transformCode = babel.transformSync(`${code}`, {
        babelrc: false,
        configFile: false,
        ...getBabelConfig({
          target: 'site',
          isTypescript: false
        })
      }).code

      const code2 = `export const ${fnName} = function() {
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
        value: code2
      })
      demo.type = 'jsx'
      demo.value = `<DemoBox title={${title}} desc={${desc}} code={\`${code}\`} preview={<${fnName}/>}>${preview}</DemoBox>`
    }
    return node
  }
}

export default attacher
