import gulp from 'gulp'
import babel from 'gulp-babel'
import getBabelConfig from '../lib/getBabelConfig'
import stream2Promise from '../utils/stream2Promise'

export type Options = {
  from: string | string[]
  to: string
  isEs: boolean
}

export default (options: Options) => {
  const { from, to, isEs } = options
  const stream = gulp
    .src(from)
    .pipe(
      babel({
        ...getBabelConfig({ target: 'lib', isTypescript: false, isEs }),
      })
    )
    .pipe(gulp.dest(to))

  return stream2Promise(stream)
}
