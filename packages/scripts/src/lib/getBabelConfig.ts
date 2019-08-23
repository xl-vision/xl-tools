export type Options = {
  target: 'lib' | 'es' | 'site'
  isTypescript: boolean
}
export default (options: Options) => {
  const { target, isTypescript } = options
  const presets: any[] = [require.resolve('@babel/preset-react')]
  const plugins: any[] = [require.resolve('@babel/plugin-transform-runtime')]

  let modules: any = false
  if (target !== 'es') {
    modules = 'commonjs'
  }

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
        plugins: ['styled-jsx-plugin-sass']
      }
    ])
  }

  if (isTypescript) {
    presets.push(require.resolve('@babel/preset-typescript'))
  }

  return {
    presets,
    plugins
  }
}
