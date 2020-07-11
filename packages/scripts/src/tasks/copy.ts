import gulp from 'gulp'
import stream2Promise from '../utils/stream2Promise'

export type Options = {
  from: string | Array<string>
  to: string
  dot?: boolean
}

export default (options: Options) => {
  const { from, to, dot } = options
  const stream = gulp
    .src(from, {
      dot,
    })
    .pipe(gulp.dest(to))
  return stream2Promise(stream)
}
