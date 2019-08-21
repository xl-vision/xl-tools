import mdx from '@mdx-js/mdx'
import Webpack from 'webpack'
import containers from 'remark-containers'
import * as babel from '@babel/core'
import getBabelConfig from '../lib/getBabelConfig'
import sass from 'node-sass'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
import DemoBox from 'site/components/demo-box'
`
const getCodeContent = (children: any, lang: string): string => {
  if (!children || children.length === 0) {
    return ''
  }
  for (const node of children) {
    if (node.type === 'code') {
      if (node.lang === lang) {
        return node.value
      }
    }
  }
  return ''
}

const parseReact2Js = (code: string) => {
  return babel.transform(code, {
    babelrc: false,
    configFile: false,
    ...getBabelConfig({
      target: 'site',
      isTypescript: false
    })
  }).code
}

const parseMd2React = async (source: string, options: any): Promise<string> => {
  let result = await mdx(source, options)
  return `${result}`
}
const mdLoader: Webpack.loader.Loader = function (source) {
  const cb = this.async()

  const prefixContent: string[] = []
  let i = 0

  const options = {
    filepath: this.resourcePath,
    remarkPlugins: [
      [containers, {
        default: true,
        custom: [{
          type: 'demo',
          element: 'DemoBox',
          transform: (node: any, title: string, tokenize: any) => {
            console.log(node)
            const jsx: string = getCodeContent(node.children, 'jsx')
            const css = getCodeContent(node.children, 'css')
            const fnName = `DEMO_${i++}`
            const code = jsx.replace(/ *export +default/, ` const ${fnName} = `)
            const style = sass.renderSync({
              data: `#${fnName}{\n${css}\n}`
            }).css.toString()
            prefixContent.push(code)

            node.data.hProperties = {
              title,
              code: jsx,
              style: css
            }
            node.children = tokenize(`<><style>${style}</style><div id='${fnName}'><${fnName}/></div></>`)
          }
        }]
      }]
    ]
  }

  parseMd2React(`${DEFAULT_RENDERER}\n${source}`, options).then(data => {
    const code = `${prefixContent.join('\n')}${data}`
    const js = parseReact2Js(code)
    cb && cb(null, js)
  }).catch(err => {
    cb && cb(err)
  })
}

export default mdLoader