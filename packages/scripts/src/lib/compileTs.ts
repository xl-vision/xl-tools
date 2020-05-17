import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import gulpTypescript from 'gulp-typescript'
import getBabelConfig from './getBabelConfig'
import chalk from 'chalk'

export type Options = {
  isEs: boolean
  tsConfigFile: string
}

const overwriteConfig = {
  declaration: true,
  module: 'ESNext'
}

export default (from: string | string[], to: string, options: Options) => {
  const { isEs, tsConfigFile } = options
  const tsProject = gulpTypescript.createProject(tsConfigFile, overwriteConfig)

  return new Promise((resolve, reject) => {

    const tsResult = gulp.src(from).pipe(
      tsProject({
        error(err) {
          reject(err)
        },
        finish(_results){
          resolve()
        }
      })
    )

    tsResult.dts.pipe(gulp.dest(to))
    tsResult.js
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
  })
}