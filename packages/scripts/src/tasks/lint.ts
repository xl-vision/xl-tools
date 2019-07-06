import fs from 'fs-extra'
import getProjectPath from '../utils/getProjectPath'
import eslint from '../lib/eslint'
import stylelint from '../lib/stylelint'

export default async () => {
  // 判断eslint.json文件是否存在
  if (fs.existsSync(getProjectPath('eslint.json'))) {
    await runEslint()
  }
  if (fs.existsSync(getProjectPath('stylelint.config.js'))) {
    await runStylelint()
  }
}

const srcDir = 'src'

const siteDir = 'site'

const runEslint = () => {
  const suffix = '{js?(x),ts?(x)}'
  const src = [`{${srcDir}, ${siteDir}}/**/*.${suffix}`]
  return eslint(src)
}

const runStylelint = () => {
  const suffix = '{scss}'

  const src = [`{${srcDir}, ${siteDir}}/**/*.${suffix}`]
  return stylelint(src)
}
