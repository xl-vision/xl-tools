import gulp from 'gulp'
import gulpEslint from 'gulp-eslint'
import streamToPromise from '../utils/stream-to-promise';

export default (src: string | string[]) => {
  const stream = gulp.src(src)
    .pipe(gulpEslint())
    .pipe(gulpEslint.failOnError())
  return streamToPromise(stream)
}