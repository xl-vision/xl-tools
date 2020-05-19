import gulp from 'gulp'
import gulpStylelint from 'gulp-stylelint'
import streamToPromise from '../utils/stream2Promise'
import chalk from 'chalk'

export type Options = {
  from: string | Array<string>
  to?: string
  configFile?: string
  fix?: boolean
}

export default (options: Options) => {
  const { from, to, configFile, fix = false } = options

  if (fix) {
    if (!to) {
      const error = `Please provide option 'to' to store files fixed.`
      console.error(chalk.red(error))
      throw new Error(error)
    }
  }

  let stream = gulp.src(from).pipe(
    gulpStylelint({
      config: configFile,
      fix,
      failAfterError: true,
      reporters: [
        {
          formatter: 'string',
          console: true,
        },
      ],
    })
  )

  if (fix) {
    stream = stream.pipe(gulp.dest(to!))
  }
  return streamToPromise(stream)
}
