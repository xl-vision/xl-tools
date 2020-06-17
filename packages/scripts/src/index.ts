import React from 'react'
import { MDXProvider } from '@mdx-js/react'

import { Block as BaseBlock } from './mdLoader/codeBlock'

export interface Block extends BaseBlock {
  preview: React.ReactNode
}

export type DemoBoxProps = {
  children: React.ReactNode
  desc: React.ReactNode
  title: React.ReactNode
  blocks: Array<Block>
}

export { MDXProvider }
