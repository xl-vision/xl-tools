import gulp from 'gulp'
import stylelint from 'gulp-stylelint'
import streamToPromise from '../utils/stream2Promise'
import { error } from '../utils/logger'
import filter from 'gulp-filter'
import getProjectPath from '../utils/getProjectPath'
import fs from 'fs-extra'

export type Options = {
  from: string | Array<string>
  to?: string
  stylelintConfig?: string
  fix?: boolean
}

export default (options: Options) => {
  const { from, to, stylelintConfig, fix = false } = options

  if (fix) {
    if (!to) {
      return error(`Please provide option 'to' to store files fixed.`)
    }
  }

  let stylelintOptions: any = {
    failAfterError: true,
    reporters: [
      {
        formatter: 'string',
        console: true,
      },
    ],
    fix,
  }

  if (stylelintConfig) {
    const stylelintConfigPath = getProjectPath(stylelintConfig)
    if (!fs.statSync(stylelintConfigPath).isFile()) {
      return error(
        `The stylelint config file '${stylelintConfig}' dose not exist, please make sure you have created it.`
      )
    }
    stylelintOptions.config = stylelintConfigPath
  }

  let stream = gulp
    .src(from)
    .pipe(
      filter(['**/*.css', '**/*.scss', '**/*.sass', '**/*.styl', '**/*.less'])
    )
    .pipe(stylelint(stylelintOptions))

  if (fix) {
    stream = stream.pipe(gulp.dest(to!))
  }
  return streamToPromise(stream)
}
