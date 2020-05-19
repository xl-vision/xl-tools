import gulp from 'gulp'
import eslint from 'gulp-eslint'
import streamToPromise from 'stream-to-promise'
import chalk from 'chalk'

export type Options = {
  from: string
  to?: string
  configFile?: string
  fix?: boolean
}

export default (options: Options) => {
  const { from, configFile, fix = false, to } = options

  if (fix) {
    if (!to) {
      const error = `Please provide option 'to' to store files fixed.`
      console.error(chalk.red(error))
      throw new Error(error)
    }
  }

  let stream = gulp
    .src(from)
    .pipe(
      eslint({
        configFile,
        fix,
      })
    )
    .pipe(eslint.formatEach())
    .pipe(eslint.failAfterError())

  if (fix) {
    stream = stream.pipe(gulp.dest(to!))
  }

  return streamToPromise(stream)
}
