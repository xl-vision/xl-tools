import rollup from 'rollup'
import babel from '@rollup/plugin-babel'
import common from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import getBabelConfig from '../lib/getBabelConfig'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import getTsconfigPath from '../lib/getTsconfigPath'

export type Options = {
  entry: string
  dest: string
  libraryName: string
  tsConfigFile?: string
  sourceMap?: boolean
}

export default async (options: Options) => {
  const {
    entry,
    dest,
    libraryName,
    sourceMap = true,
    tsConfigFile = 'tsconfig.json',
  } = options

  const isTypescript =
    entry.lastIndexOf('.ts') > 0 || entry.lastIndexOf('.tsx') > 0

  let tsconfig = ''
  if (isTypescript) {
    tsconfig = getTsconfigPath(tsConfigFile)
  }

  const { plugins, presets } = getBabelConfig({ isEs: true })

  if (isTypescript) {
    presets.push(require.resolve('@babel/preset-typescript'))
  }

  const inputOptions: rollup.InputOptions = {
    input: entry,
    external: ['react', 'react-dom', 'react-native'],
    plugins: [
      resolve({
        preferBuiltins: true,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      }),
      common({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      }),
      json({
        namedExports: false,
      }),
      isTypescript &&
        typescript({
          tsconfig,
          check: true,
          tsconfigOverride: {
            compilerOptions: {
              sourceMap,
              declarationMap: false,
            },
          },
        }),
      babel({
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        babelHelpers: 'bundled',
        plugins,
        presets,
      }),
    ].filter(Boolean),
  }

  const outputOptions1: rollup.OutputOptions = {
    format: 'umd',
    dir: dest,
    file: `${libraryName}.js`,
    plugins: [
      replace({
        'process.env.NODE_ENV': `development`,
      }),
    ],
  }
  const outputOptions2: rollup.OutputOptions = {
    format: 'umd',
    dir: dest,
    file: `${libraryName}.min.js`,
    plugins: [
      babel({
        plugins: [
          require.resolve('babel-plugin-transform-react-remove-prop-types'),
        ],
      }),
      replace({
        'process.env.NODE_ENV': `production`,
      }),
      terser(),
    ],
  }

  const bundle = await rollup.rollup(inputOptions)

  await bundle.write(outputOptions1)
  await bundle.write(outputOptions2)
}
