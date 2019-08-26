import gulp from 'gulp'
import gulpStylelint from 'gulp-stylelint'
import streamToPromise from '../utils/stream2Promise';

export type Options = {
  fix?: boolean
  dest?: string
}

export default (src: string, options: Options = {}) => {

  const {
    fix = false,
    dest
  } = options

  if (fix) {
    if (!dest) {
      throw new Error('Please give dest path to fix.')
    }
  }

  let stream = gulp.src(src)
    .pipe(gulpStylelint({
      fix,
      failAfterError: true,
      reporters: [{
        formatter: 'string',
        console: true
      }]
    }))

  if (fix) {
    stream = stream.pipe(gulp.dest(dest!))
  }
  return streamToPromise(stream)
}
