import React from 'react'
import { MDXProvider } from '@mdx-js/react'

import { Block as BaseBlock } from './mdLoader/codeBlock'

export interface Block extends BaseBlock {
  preview: React.ReactElement
}

export type DemoBoxProps = {
  children: React.ReactElement
  desc: React.ReactFragment
  title: React.ReactElement
  blocks: Array<Block>
}

export { MDXProvider }
