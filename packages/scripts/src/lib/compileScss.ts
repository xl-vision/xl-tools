import gulp from 'gulp'
import gulpSass from 'gulp-sass'
import gulpPostcss from 'gulp-postcss'
import gulpCleanCss from 'gulp-clean-css'
import streamToPromise from '../utils/stream-to-promise';

export type Options = {
  beautify: boolean
}

export default (from: string | string[], to: string, options: Options = {
  beautify: true
}) => {
  const {beautify} = options

  const stream = gulp.src(from)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: beautify ? 'beautify' : 'none'
  }))
  .pipe(gulp.dest(to))

  return streamToPromise(stream)
}
