import gulp from 'gulp'
import stream2Promise from '../utils/stream2Promise'

export type Options = {
  from: string | string[]
  to: string
}

export default (options: Options) => {
  const { from, to } = options
  const stream = gulp.src(from).pipe(gulp.dest(to))
  return stream2Promise(stream)
}
