import gulp from 'gulp'
import babel from 'gulp-babel'
import typescript from 'gulp-typescript'
import getBabelConfig from '../config/getBabelConfig'
import getTsconfigPath from '../utils/getTsconfigPath'
import filter from 'gulp-filter'

const defaultReporter = typescript.reporter.defaultReporter()

export type Options = {
  from: string | Array<string>
  to: string
  es: boolean
  tsConfig: string
}

const overwriteConfig = {
  declaration: true,
  module: 'ESNext',
}

export default (options: Options) => {
  const { from, to, es, tsConfig } = options

  const tsConfigPath = getTsconfigPath(tsConfig)

  return new Promise((resolve, reject) => {
    const tsProject = typescript.createProject(tsConfigPath, overwriteConfig)

    const errors: Array<any> = []

    const tsResult = gulp
      .src(from)
      .pipe(filter(['**/*.ts?(x)']))
      .pipe(
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

    tsResult.js.pipe(babel(getBabelConfig({ es }))).pipe(gulp.dest(to))
  })
}
