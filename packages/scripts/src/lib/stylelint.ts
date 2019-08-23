import gulp from 'gulp'
import gulpStylelint from 'gulp-stylelint'
import streamToPromise from '../utils/stream2Promise';

export default (src: string | string[]) => {
  const stream = gulp.src(src)
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'string',
        console: true
      }]
    }))
  return streamToPromise(stream)
}
