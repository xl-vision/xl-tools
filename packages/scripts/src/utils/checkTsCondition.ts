import fs from 'fs-extra'
import gulp from 'gulp'
import chalk from 'chalk'
/**
 * 检查ts条件是否满足
 */
export default (tsSrc: string | string[], tsConfigFile: string) => {
  if (!fs.existsSync(tsConfigFile)) {
    // 判断是否存在ts(x)文件，如果存在，给出警告
    gulp.src(tsSrc).once('pipe', () => {
      console.warn(
        chalk.yellow('Have you forgotten to create the tsconfig.json file?')
      )
    })
    return false
  }

  return true
}
