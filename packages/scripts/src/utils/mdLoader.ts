import mdx from '@mdx-js/mdx'
import Webpack from 'webpack'
import demoBoxPlugin from './demoBoxPlugin'
import * as babel from '@babel/core'
import getBabelConfig from '../lib/getBabelConfig'
import highlight from 'rehype-highlight'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
`

const parseMd2React = async (source: string, options: any): Promise<string> => {
  let result = await mdx(source, options)
  return `${result}`
}

const mdLoader: Webpack.loader.Loader = function (source) {
  const cb = this.async()

  const prefixContent: string[] = []

  const options = {
    filepath: this.resourcePath,
    remarkPlugins: [
      demoBoxPlugin
    ],
    rehypePlugins: [
      highlight
    ]
  }

  parseMd2React(`${DEFAULT_RENDERER}\n${source}`, options).then(data => {
    const code = `${prefixContent.join('\n')}${data}`
    const transformCode = babel.transformSync(`${code}`, {
      babelrc: false,
      configFile: false,
      ...getBabelConfig({
        target: 'site',
        isTypescript: false
      })
    }).code
    cb && cb(null, transformCode)
  }).catch(err => {
    cb && cb(err)
  })
}

export default mdLoader