export type Options = {
  target: 'lib' | 'dist' | 'site'
  isTypescript: boolean
  isEs?: boolean
}
export default (options: Options) => {
  const { target, isTypescript, isEs = true } = options
  const presets: any[] = [require.resolve('@babel/preset-react')]
  const plugins: any[] = [require.resolve('@babel/plugin-transform-runtime')]

  presets.push([
    require.resolve('@babel/preset-env'),
    {
      modules: isEs ? false : 'commonjs'
    }
  ])

  if (target === 'site') {
    plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'))
    plugins.push([
      require.resolve('styled-jsx/babel'),
      {
        plugins: [require.resolve('styled-jsx-plugin-sass')]
      }
    ])
  }

  if (target === 'site' || target === 'dist') {
    plugins.push([require.resolve('babel-plugin-transform-react-remove-prop-types'), {
      mode: 'wrap'
    }])
  }

  if (isTypescript) {
    presets.push(require.resolve('@babel/preset-typescript'))
  }

  return {
    presets,
    plugins
  }
}
