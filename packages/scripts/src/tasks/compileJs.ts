import gulp from 'gulp'
import babel from 'gulp-babel'
import getBabelConfig from '../config/getBabelConfig'
import stream2Promise from '../utils/stream2Promise'

export type Options = {
  from: string | Array<string>
  to: string
  es: boolean
}

export default (options: Options) => {
  const { from, to, es } = options

  const stream = gulp
    .src(from)
    .pipe(babel(getBabelConfig({ es })))
    .pipe(gulp.dest(to))

  return stream2Promise(stream)
}
