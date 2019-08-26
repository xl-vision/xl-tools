import gulp from 'gulp'
import gulpSass from 'gulp-sass'
import gulpPostcss from 'gulp-postcss'
import gulpCleanCss from 'gulp-clean-css'
import gulpRename from 'gulp-rename'
import streamToPromise from '../utils/stream2Promise';

export type Options = {
  beautify?: boolean,
  rename?: (path: gulpRename.ParsedPath) => any
}

export default (from: string | string[], to: string, options: Options) => {
  const {
    beautify = true,
    rename = (path: gulpRename.ParsedPath) => path
  } = options

  const stream = gulp.src(from)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: beautify ? 'beautify' : 'none'
  }))
  .pipe(gulpRename(rename))
  .pipe(gulp.dest(to))

  return streamToPromise(stream)
}
