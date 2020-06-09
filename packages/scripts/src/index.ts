import React from 'react'
import { MDXProvider } from '@mdx-js/react'

import { Block as BaseBlock } from './mdLoader/codeBlock'

export interface Block extends BaseBlock {
  preview: React.ReactFragment
}

export type DemoBoxProps = {
  children: React.ReactNode
  desc: React.ReactFragment
  title: React.ReactFragment
  blocks: Array<Block>
}

export { MDXProvider }
