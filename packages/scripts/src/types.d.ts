declare module 'gulp-stylelint'
declare module 'gulp-eslint'
declare module 'gulp-clean-css'
declare module 'remark-containers'
declare module '@mdx-js/mdx'
declare module '@babel/core'
declare module 'rehype-highlight'
declare module 'stream-to-promise'
declare module 'detect-port-alt' {
  const fn: (port: number, host: string) => Promise<number>
  export default fn
}