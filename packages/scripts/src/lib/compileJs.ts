import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import streamToPromise from '../utils/stream-to-promise'
import getBabelConfig, {Options as BabelConfigOptions} from './getBabelConfig'

export type Options = {
  target: BabelConfigOptions['target']
}

export default (from: string | string[], to: string, options: Options) => {
  const {target} = options
  const stream = gulp.src(from)
    .pipe(gulpBabel({
      ...getBabelConfig({target, isTypescript: false})
    }))
    .pipe(gulp.dest(to))
  return streamToPromise(stream)
}
