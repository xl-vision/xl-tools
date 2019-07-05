import gulp from 'gulp'
import gulpStylelint from 'gulp-stylelint'
import streamToPromise from '../utils/stream-to-promise';

export default (src: string | string[]) => {
  const stream = gulp.src(src)
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'verbose',
        console: true
      }]
    }))
  return streamToPromise(stream)
}
