import gulp from 'gulp'
import eslint from 'gulp-eslint'
import streamToPromise from 'stream-to-promise'
import { error } from '../utils/logger'
import fs from 'fs-extra'
import getProjectPath from '../utils/getProjectPath'

export type Options = {
  from: string | Array<string>
  to?: string
  eslintConfig?: string
  fix?: boolean
}

export default (options: Options) => {
  const { from, eslintConfig, fix = false, to } = options

  if (fix) {
    if (!to) {
      return error(`Please provide option 'to' to store files fixed.`)
    }
  }

  let eslintOptions: any = { fix }

  if (eslintConfig) {
    const eslintConfigPath = getProjectPath(eslintConfig)
    if (!fs.existsSync(eslintConfigPath) || !fs.statSync(eslintConfigPath).isFile()) {
      return error(
        `The eslint config file '${eslintConfigPath}' dose not exist, please make sure you have created it.`
      )
    }
    eslintOptions.configFile = eslintConfigPath
  }

  let stream = gulp
    .src(from)
    .pipe(eslint(eslintOptions))
    .pipe(eslint.formatEach())
    .pipe(eslint.failAfterError())

  if (fix) {
    stream = stream.pipe(gulp.dest(to!))
  }

  return streamToPromise(stream)
}
