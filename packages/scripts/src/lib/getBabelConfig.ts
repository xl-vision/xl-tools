export type Options = {
  target: 'lib' | 'dist' | 'site'
  isTypescript: boolean
  isEs?: boolean
}
export default (options: Options) => {
  const { target, isTypescript, isEs = false } = options
  const presets: any[] = [require.resolve('@babel/preset-react')]
  const plugins: any[] = [require.resolve('@babel/plugin-transform-runtime')]

  const modules = (target === 'dist' || target === 'site' || isEs) ? false : 'commonjs'

  presets.push([
    require.resolve('@babel/preset-env'),
    {
      modules
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
      mode: 'remove'
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
