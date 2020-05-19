export type Options = {
  isEs?: boolean
}
export default (options: Options) => {
  const { isEs = true } = options
  const presets: any[] = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: isEs ? false : 'commonjs',
      },
    ],
    require.resolve('@babel/preset-react'),
  ]

  const plugins: any[] = [require.resolve('babel-plugin-array-includes')]

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
