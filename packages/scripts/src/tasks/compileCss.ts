import gulp from 'gulp'
import postcss from 'gulp-postcss'
import cleanCss from 'gulp-clean-css'
import rename from 'gulp-rename'
import soucemaps from 'gulp-sourcemaps'
import stream2Promise from '../utils/stream2Promise'

export type Options = {
  from: string | string[]
  to: string
  beautify?: boolean
  rename?: string | rename.Options | ((path: rename.ParsedPath) => any)
  sourceMap?: boolean
}

export default (options: Options) => {
  const {
    from,
    to,
    beautify = true,
    sourceMap = false,
    rename: renameOption = (path) => path,
  } = options

  let stream: NodeJS.ReadWriteStream = gulp.src(from)

  if (sourceMap) {
    stream = stream.pipe(soucemaps.init())
  }
  stream = stream
    .pipe(postcss())
    .pipe(
      cleanCss({
        level: 2,
        format: beautify ? 'beautify' : 'none',
      })
    )
    .pipe(rename(renameOption as any))
  if (sourceMap) {
    stream = stream.pipe(soucemaps.write())
  }

  stream = stream.pipe(gulp.dest(to))

  return stream2Promise(stream)
}
