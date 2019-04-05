declare module 'gulp-stylelint' {
  type Syntax =
    | 'css-in-js'
    | 'html'
    | 'less'
    | 'markdown'
    | 'sass'
    | 'scss'
    | 'sugarss'
  interface Options {
    syntax?: Syntax
    configFile?: string
    reporters?: [
      {
        formatter?: 'verbose';
        console?: true;
      }
    ]
  }
  const fn: (options: Options) => NodeJS.ReadWriteStream
  export default fn
}

