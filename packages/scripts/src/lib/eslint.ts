import gulp from 'gulp'
import gulpEslint from 'gulp-eslint'
import streamToPromise from '../utils/stream2Promise';
import through2 from 'through2'

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
    .pipe(gulpEslint({
      fix
    }))
    .pipe(gulpEslint.formatEach())
    .pipe(gulpEslint.failAfterError())

  if (fix) {
    stream = stream.pipe(gulp.dest(dest!))
  } else {
    stream = stream.pipe(through2.obj(function (chunk, enc, callback) {
      callback()
    }))
  }

  return streamToPromise(stream)
}