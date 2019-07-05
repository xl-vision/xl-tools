import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import streamToPromise from '../utils/stream-to-promise';

export default (from: string | string[], to: string) => {
  const stream = gulp.src(from)
    .pipe(gulpBabel())
    .pipe(gulp.dest(to))
  return streamToPromise(stream)
}
