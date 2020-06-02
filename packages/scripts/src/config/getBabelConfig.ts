export type Options = {
  es?: boolean
}
export default (options: Options) => {
  const { es = true } = options
  const presets: any[] = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: es ? false : 'commonjs',
      },
    ],
    require.resolve('@babel/preset-react'),
  ]

  const plugins: any[] = [
    require.resolve('babel-plugin-array-includes'),
    require.resolve('@babel/plugin-transform-runtime'),
  ]

  // if (!bundle) {
  //   plugins.push(require.resolve('@babel/plugin-transform-runtime'))
  // }

  // if (isTypescript) {
  //   presets.push(require.resolve('@babel/preset-typescript'))
  // }

  // if (dynamicImport) {
  //   plugins.push([require.resolve('@babel/plugin-syntax-dynamic-import')])
  // }

  return {
    presets,
    plugins,
  }
}
