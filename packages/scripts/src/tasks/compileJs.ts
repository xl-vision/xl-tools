import gulp from 'gulp'
import babel from 'gulp-babel'
import getBabelConfig from '../config/getBabelConfig'
import stream2Promise from '../utils/stream2Promise'

export type Options = {
  from: string | Array<string>
  to: string
  es: boolean
  dot?: boolean
}

export default (options: Options) => {
  const { from, to, es, dot } = options

  const stream = gulp
    .src(from, {
      dot,
    })
    .pipe(babel(getBabelConfig({ es })))
    .pipe(gulp.dest(to))

  return stream2Promise(stream)
}
