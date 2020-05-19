import gulp from 'gulp'
import babel from 'gulp-babel'
import typescript from 'gulp-typescript'
import getBabelConfig from '../lib/getBabelConfig'
import fs from 'fs-extra'
import chalk from 'chalk'
import getProjectPath from '../utils/getProjectPath'

const defaultReporter = typescript.reporter.defaultReporter()

export type Options = {
  from: string | Array<string>
  to: string
  isEs: boolean
  tsConfigFile: string
}

const overwriteConfig = {
  declaration: true,
  module: 'ESNext',
}

export default (options: Options) => {
  const { from, to, isEs, tsConfigFile = 'tsconfig.json' } = options

  if (!tsConfigFile) {
    const error = `The tsconfig file is not exist, please make sure you have created it.`
    console.error(chalk.red(error))
    throw new Error(error)
  }

  const tsConfigFilePath = getProjectPath(tsConfigFile)

  // 判断tsconfig是否存在
  if (!fs.existsSync(tsConfigFilePath)) {
    const error = `The tsconfig file '${tsConfigFile}' does not exist, please make sure you have created it.`
    console.error(chalk.red(error))
    throw new Error(error)
  }

  return new Promise((resolve, reject) => {
    const tsProject = typescript.createProject(
      tsConfigFilePath,
      overwriteConfig
    )

    const errors: Array<any> = []

    const tsResult = gulp.src(from).pipe(
      tsProject({
        error(err, ts) {
          defaultReporter.error!(err, ts)
          errors.push(err)
        },
        finish() {
          if (errors.length > 0) {
            return reject(errors)
          }
          return resolve()
        },
      })
    )

    tsResult.dts.pipe(gulp.dest(to))

    tsResult.js
      .pipe(
        babel({
          // 此时已经是js，不需要启用isTypescript
          ...getBabelConfig({ isEs }),
        })
      )
      .pipe(gulp.dest(to))
  })
}
