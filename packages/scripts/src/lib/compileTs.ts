import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import gulpTypescript from 'gulp-typescript'
import streamToPromise from '../utils/stream2Promise'
import getBabelConfig from './getBabelConfig'

export type Options = {
  isEs: boolean
  tsConfigFile: string
}

const reporter = gulpTypescript.reporter.defaultReporter()

const overwriteConfig = {
  declaration: true,
  module: 'ESNext'
}

export default  (from: string | string[], to: string, options: Options) => {
  const { isEs, tsConfigFile } = options
  const tsProject = gulpTypescript.createProject(tsConfigFile, overwriteConfig)

  const tsResult = gulp.src(from).pipe(
    tsProject({
      error(err: gulpTypescript.reporter.TypeScriptError, ts: any) {
        reporter.error!(err, ts)
        process.exit(1)
      },
      finish: reporter.finish
    })
  )

  const dts = tsResult.dts.pipe(gulp.dest(to))
  const js = tsResult.js
    .pipe(
      gulpBabel({
        ...getBabelConfig({
          target: 'lib',
          isTypescript: true,
          isEs
        })
      })
    )
    .pipe(gulp.dest(to))

  return streamToPromise(dts, js)
}
