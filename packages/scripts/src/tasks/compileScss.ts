import gulp from 'gulp'
import sass from 'gulp-sass'
import soucemaps from 'gulp-sourcemaps'
import dartSass from 'dart-sass'
import stream2Promise from '../utils/stream2Promise'
import handlerCss from '../utils/handleCss'

// @ts-ignore
sass.compiler = dartSass

export type Options = {
  beautify: boolean
  from: string | Array<string>
  to: string
  rename?: string
  sourceMap: boolean
  postcssConfig?: string
  dot?: boolean
}

export default (options: Options) => {
  const { from, to, beautify, sourceMap, rename, postcssConfig, dot } = options

  let stream: NodeJS.ReadWriteStream = gulp.src(from, {
    dot,
  })

  if (sourceMap) {
    stream = stream.pipe(soucemaps.init())
  }
  stream = stream.pipe(sass())
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
