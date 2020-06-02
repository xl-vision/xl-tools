import gulp from 'gulp'
import babel from 'gulp-babel'
import getBabelConfig from '../config/getBabelConfig'
import stream2Promise from '../utils/stream2Promise'
import filter from 'gulp-filter'

export type Options = {
  from: string | Array<string>
  to: string
  es: boolean
}

export default (options: Options) => {
  const { from, to, es } = options

  const stream = gulp
    .src(from)
    .pipe(filter(['**/*.js?(x)']))
    .pipe(babel(getBabelConfig({ es })))
    .pipe(gulp.dest(to))

  return stream2Promise(stream)
}
