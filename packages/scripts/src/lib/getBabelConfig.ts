export type Options = {
  isTypescript?: boolean
  isEs?: boolean
  removePropTypes?: boolean
}
export default (options: Options) => {
  const { isTypescript, removePropTypes, isEs = true } = options
  const presets: any[] = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: isEs ? false : 'commonjs',
      },
    ],
    require.resolve('@babel/preset-react'),
  ]

  const plugins: any[] = [
    require.resolve('@babel/plugin-transform-runtime'),
    require.resolve('babel-plugin-array-includes'),
  ]

  if (isTypescript) {
    presets.push(require.resolve('@babel/preset-typescript'))
  }

  if (removePropTypes) {
    plugins.push([
      require.resolve('babel-plugin-transform-react-remove-prop-types'),
      {
        mode: 'remove',
      },
    ])
  }

  return {
    presets,
    plugins,
  }
}
