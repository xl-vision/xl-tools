import { warn } from '../utils/logger'

export type Options = {
  es?: boolean
  runtime?: boolean
}
export default (options: Options) => {
  const { es, runtime = true } = options

  const presets: any[] = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: es ? false : 'commonjs',
        targets: {
          browsers: [
            'last 2 versions',
            'Firefox ESR',
            '> 1%',
            'ie >= 9',
            'iOS >= 8',
            'Android >= 4',
          ],
        },
      },
    ],
    require.resolve('@babel/preset-react'),
  ]

  const plugins: any[] = [require.resolve('babel-plugin-array-includes')]

  if (runtime) {
    try {
      require.resolve('@babel/runtime/package.json')
      plugins.push([
        require.resolve('@babel/plugin-transform-runtime'),
        {
          helpers: true,
        },
      ])
    } catch (err) {
      warn(
        `The library '@babel/runtime' is not installed, please use 'npm install @babel/runtime --save' to install it.`
      )
    }
  }

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
