import gulp from 'gulp'
import gulpSass from 'gulp-sass'
import gulpPostcss from 'gulp-postcss'
import gulpCleanCss from 'gulp-clean-css'

export type Options = {
  src: string| string[]
  dest: string
}

const compileScss = ({
  src,
  dest
}:Options) => {
  return gulp.src(src)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: 'beautify'
  }))
  .pipe(gulp.dest(dest))
}

export default compileScss
