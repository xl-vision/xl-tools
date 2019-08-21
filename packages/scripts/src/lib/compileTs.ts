import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import gulpTypescript from 'gulp-typescript'
import streamToPromise from '../utils/stream2Promise'
import getBabelConfig, { Options as BabelConfigOptions } from './getBabelConfig'

export type Options = {
  target: BabelConfigOptions['target']
  tsConfigFile: string
}

const reporter = gulpTypescript.reporter.defaultReporter()

const overwriteConfig = {
  declaration: true,
  module: 'ESNext'
}

export default (from: string | string[], to: string, options: Options) => {
  const { target, tsConfigFile } = options
  const tsProject = gulpTypescript.createProject(tsConfigFile, overwriteConfig)

  const tsResult = gulp.src(from).pipe(
    tsProject({
      error(err: Error, ts: any) {
        throw err
      },
      finish: reporter.finish
    })
  )

  const dts = tsResult.dts.pipe(gulp.dest(to))
  const js = tsResult.js
    .pipe(
      gulpBabel({
        ...getBabelConfig({
          target,
          isTypescript: true
        })
      })
    )
    .pipe(gulp.dest(to))

  return streamToPromise(dts, js)
}
