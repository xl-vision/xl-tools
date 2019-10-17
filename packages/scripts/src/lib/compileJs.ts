import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import streamToPromise from '../utils/stream2Promise'
import getBabelConfig from './getBabelConfig'

export type Options = {
  isEs: boolean,
}

export default (from: string | string[], to: string, options: Options) => {
  const { isEs } = options
  const stream = gulp.src(from)
    .pipe(gulpBabel({
      ...getBabelConfig({ target: 'lib', isTypescript: false, isEs })
    }))
    .pipe(gulp.dest(to))
  return streamToPromise(stream)
}
