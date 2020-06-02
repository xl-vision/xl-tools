import rollup from 'rollup'
import babel from '@rollup/plugin-babel'
import common from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import getBabelConfig from '../config/getBabelConfig'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import getTsconfigPath from '../utils/getTsconfigPath'
import getEntryFile from '../utils/getEntryFile'
import getProjectPath from '../utils/getProjectPath'

export type Options = {
  entry: string
  dest: string
  libraryName: string
  tsConfig: string
  sourceMap: boolean
}

export default async (options: Options) => {
  const { entry, dest, libraryName, sourceMap, tsConfig } = options

  const destPath = getProjectPath(dest)
  const entryPath = getEntryFile(entry, ['ts', 'tsx', 'js', 'jsx'])

  const isTypescript =
    entryPath.lastIndexOf('.ts') > 0 || entryPath.lastIndexOf('.tsx') > 0

  let tsconfigPath = ''
  if (isTypescript) {
    tsconfigPath = getTsconfigPath(tsConfig)
  }

  const { plugins, presets } = getBabelConfig({ es: true })

  // if (isTypescript) {
  //   presets.push(require.resolve('@babel/preset-typescript'))
  // }

  const inputOptions: rollup.InputOptions = {
    input: entryPath,
    external: ['react', 'react-dom', 'react-native'],
    plugins: [
      resolve({
        preferBuiltins: true,
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      }),
      common({
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        sourceMap,
      }),
      json({
        namedExports: false,
      }),
      isTypescript &&
        typescript({
          tsconfig: tsconfigPath,
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
        exclude: 'node_modules/**',
        sourceMaps: sourceMap ? 'inline' : false,
        plugins,
        presets,
      }),
    ].filter(Boolean),
  }

  const outputOptions1: rollup.OutputOptions = {
    sourcemap: sourceMap ? 'inline' : false,
    format: 'umd',
    dir: destPath,
    file: `${libraryName}.js`,
    plugins: [
      replace({
        'process.env.NODE_ENV': `development`,
      }),
    ],
  }
  const outputOptions2: rollup.OutputOptions = {
    sourcemap: sourceMap ? 'inline' : false,
    format: 'umd',
    dir: destPath,
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
