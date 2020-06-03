import prism from '@mapbox/rehype-prism'
import mdx from '@mdx-js/mdx'
import webpack from 'webpack'
import createDemoBoxPlugin from './demoBoxPlugin'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'`

const mdLoader: webpack.loader.Loader = function (source) {
  const callback = this.async()!

  const demoBoxPlugin = createDemoBoxPlugin(this)

  mdx(source, {
    filepath: this.resourcePath,
    remarkPlugins: [demoBoxPlugin],
    rehypePlugins: [prism],
  })
    .then((result: string) => {
      callback(null, `${DEFAULT_RENDERER}\n${result}`)
    })
    .catch((err: any) => callback(err))
}

export default mdLoader
