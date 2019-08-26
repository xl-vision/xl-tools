import gulp from 'gulp'
import streamToPromise from '../utils/stream2Promise';

export default (from: string | string[], to: string) => {

  const stream = gulp.src(from).pipe(gulp.dest(to))

  return streamToPromise(stream)
}
