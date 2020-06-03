import gulp from 'gulp'
import stylus from 'gulp-stylus'
import soucemaps from 'gulp-sourcemaps'
import stream2Promise from '../utils/stream2Promise'
import handlerCss from '../utils/handleCss'

export type Options = {
  beautify: boolean
  from: string | Array<string>
  to: string
  rename?: string
  sourceMap: boolean
  postcssConfig?: string
}

export default (options: Options) => {
  const { from, to, beautify, sourceMap, rename, postcssConfig } = options

  let stream: NodeJS.ReadWriteStream = gulp
    .src(from)

  if (sourceMap) {
    stream = stream.pipe(soucemaps.init())
  }
  stream = stream.pipe(stylus())
  stream = handlerCss(stream, {
    beautify,
    rename,
    postcssConfig,
  })
  if (sourceMap) {
    stream = stream.pipe(soucemaps.write('.'))
  }

  stream = stream.pipe(gulp.dest(to))
  return stream2Promise(stream)
}
