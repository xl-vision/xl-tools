declare module 'gulp-stylelint'
declare module 'gulp-eslint'
declare module 'gulp-clean-css'
declare module 'remark-containers'
declare module '@mdx-js/mdx'
declare module '@babel/core'
declare module '@mapbox/rehype-prism'
declare module 'stream-to-promise'
declare module 'dart-sass'
declare module '@rollup/plugin-babel'
// 最新的dts还没有更新
declare module 'copy-webpack-plugin'
declare module 'detect-port-alt' {
  const fn: (port: number, host: string) => Promise<number>
  export default fn
}

declare module '@mdx-js/react' {
  import { ComponentType, ReactNode, Component } from 'react'

  type MDXProps = {
    children: ReactNode
    components?: { [key: string]: ComponentType }
  }
  export class MDXProvider extends Component<MDXProps> {}
}
