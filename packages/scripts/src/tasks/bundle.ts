import * as rollup from 'rollup'
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
import path from 'path'
import { toCamel } from '../utils/stringUtils'

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

  const { plugins, presets } = getBabelConfig({ es: true, runtime: false })

  // if (isTypescript) {
  //   presets.push(require.resolve('@babel/preset-typescript'))
  // }
  const getInputOptions = (isDev: boolean) => {
    const inputOptions: rollup.InputOptions = {
      input: entryPath,
      external: ['react', 'react-dom', 'react-native'],
      plugins: [
        isTypescript && typescript({
          tsconfig: tsconfigPath,
          check: true,
          tsconfigOverride: {
            compilerOptions: {
              sourceMap,
              declarationMap: false,
              module: 'ESNext'
            },
          },
        }),
        babel({
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          babelHelpers: 'bundled',
          exclude: 'node_modules/**',
          sourceMaps: sourceMap ? 'inline' : false,
          plugins: plugins.concat(isDev ? [] : [require.resolve('babel-plugin-transform-react-remove-prop-types')]),
          presets,
        }),
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
        replace({
          'process.env.NODE_ENV': isDev ? "'development'" : "'production'",
        }),
      ].filter(Boolean),
    }

    return inputOptions
  }

  const name = toCamel(libraryName)

  const getOutputOption = (isDev: boolean) => {
    const outputOptions: rollup.OutputOptions = {
      sourcemap: sourceMap,
      format: 'umd',
      globals: {
        react: "React",
        'react-dom': "ReactDOM",
        'react-native': "ReactNative",
      },
      name,
      file: path.join(destPath, `${libraryName}${isDev ? '' : '.min'}.js`),
      plugins: [
        !isDev && terser(),
      ].filter(Boolean) as any,
    }

    return outputOptions
  }


  const devBundle = await rollup.rollup(getInputOptions(true))
  await devBundle.write(getOutputOption(true))

  const prodBundle = await rollup.rollup(getInputOptions(false))
  await prodBundle.write(getOutputOption(false))
}
