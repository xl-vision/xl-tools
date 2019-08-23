import eslint from '../lib/eslint'
import stylelint from '../lib/stylelint'
import { SOURCE_DIR, SITE_DIR } from './entry';

export default () => {
  // 判断eslint.json文件是否存在
  return Promise.all([runEslint(), runStylelint()])
}

const srcDir = SOURCE_DIR

const siteDir = SITE_DIR

const runEslint = () => {
  const suffix = '{js?(x),ts?(x)}'
  const src = [`{${srcDir},${siteDir}}/**/*.${suffix}`]
  return eslint(src)
}

const runStylelint = () => {
  const suffix = '{scss}'

  const src = [`{${srcDir},${siteDir}}/**/*.${suffix}`]
  return stylelint(src)
}
