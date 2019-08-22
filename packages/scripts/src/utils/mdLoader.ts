import mdx from '@mdx-js/mdx'
import Webpack from 'webpack'
import sass from 'node-sass'
import demoBoxPlugin from './demoBoxPlugin'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
import DemoBox from 'site/components/demo-box'
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
    ]
  }

  parseMd2React(`${DEFAULT_RENDERER}\n${source}`, options).then(data => {
    const code = `${prefixContent.join('\n')}${data}`
    cb && cb(null, code)
  }).catch(err => {
    cb && cb(err)
  })
}

export default mdLoader