import gulp from 'gulp'
import less from 'gulp-less'
import soucemaps from 'gulp-sourcemaps'
import stream2Promise from '../utils/stream2Promise'
import handlerCss from '../utils/handleCss'
import filter from 'gulp-filter'

export type Options = {
  beautify: boolean
  from: string | Array<string>
  to: string
  rename?: string
  sourceMap: boolean
  postcssConfig?: string
}

export default (options: Options) => {
  const { from, to, beautify, sourceMap, postcssConfig, rename } = options

  let stream: NodeJS.ReadWriteStream = gulp
    .src(from)
    .pipe(filter(['**/*.less']))

  if (sourceMap) {
    stream = stream.pipe(soucemaps.init())
  }
  stream = stream.pipe(less())
  stream = handlerCss(stream, {
    beautify,
    rename,
    postcssConfig,
  })

  if (sourceMap) {
    stream = stream.pipe(soucemaps.write())
  }

  stream = stream.pipe(gulp.dest(to))
  return stream2Promise(stream)
}
