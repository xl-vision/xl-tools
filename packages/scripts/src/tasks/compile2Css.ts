import compileScss from "../lib/compileScss"
import { default as CopyFn } from "../lib/copy"
import compileCss from "../lib/compileCss"

export type Options = {
  dir: string,
  dest: string,
  suffixes: Array<string>
  beautify: boolean,
  copy: boolean
}

export default async (options: Options) => {
  const {
    dir,
    suffixes,
    dest,
    beautify,
    copy
  } = options


  for (const suffix of suffixes) {
    const src = [`${dir}/**/*.${suffix}`, '!**/__*__/**']
    if (suffix === 'css') {
      await compileCss(src, dest, { beautify })
    } else if (suffix === 'sass' || suffix === 'scss') {
      await compileScss(src, dest, { beautify })
    } else {
      throw new Error('Cound not handle with file with suffix:' + suffix)
    }
    if (copy) {
      await CopyFn(src, dest)
    }
  }
}
