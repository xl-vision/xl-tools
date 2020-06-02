import cleanCss from 'gulp-clean-css'
import rename from 'gulp-rename'
import postcss from 'gulp-postcss'
import getPostcssConfig from '../config/getPostcssConfig'

export type Options = {
  beautify?: boolean
  rename?: string | rename.Options | ((path: rename.ParsedPath) => any)
  postcssConfig?: string
}

export default (stream: NodeJS.ReadWriteStream, options: Options) => {
  const {
    beautify = true,
    rename: renameOption = (path) => path,
    postcssConfig,
  } = options

  stream = stream
    .pipe(postcss(getPostcssConfig(postcssConfig)))
    .pipe(
      cleanCss({
        level: 2,
        format: beautify ? 'beautify' : 'none',
      })
    )
    .pipe(rename(renameOption as any))

  return stream
}
