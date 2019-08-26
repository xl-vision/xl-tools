import stylelint from '../lib/stylelint'

export type Options = {
  fix: boolean,
  suffixes: Array<string>
  // 指定校验的目录，支持逗号隔开
  dirs: Array<string>
}

export default async (options: Options) => {
  const {
    fix,
    suffixes,
    dirs
  } = options

  const suffixString = suffixes.reduce((a, b) => a + ',' + b)

  if (!suffixString) {
    return
  }

  for (const path of dirs) {
    const match = `${path}/**/*.{${suffixString}}`
    await stylelint(match, {
      fix,
      dest: path
    })
  }
}
