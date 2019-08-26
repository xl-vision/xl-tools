import eslint from '../lib/eslint'

export type Options = {
  fix: boolean,
  suffixes: Array<string>,
  // 指定校验的目录，支持逗号隔开
  dirs: Array<string>
}

export default async (options: Options) => {
  const {
    fix,
    dirs,
    suffixes
  } = options

  const suffixString = suffixes.reduce((a, b) => a + ',' + b)

  if (!suffixString) {
    return
  }

  for (const dir of dirs) {
    const match = `${dir}/**/*.{${suffixString}}`
    await eslint(match, {
      fix,
      dest: dir
    })
  }
}
