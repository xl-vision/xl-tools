import compileJs from '../lib/compileJs'
import compileTs from '../lib/compileTs'
import getProjectPath from '../utils/getProjectPath'
import checkTsCondition from '../utils/checkTsCondition'

export default () => {
  return compileAll(true)
}

export const compileAll = (isEs = false) => {
  const dest = isEs ? 'es' : 'lib'
  const srcDir = 'src'

  const jsSrc = [`${srcDir}/**/*.js?(x)`, `!${srcDir}/**/{test,doc}/**`]
  const promise3 = compileJs(jsSrc, dest, {
    target: isEs ? 'es' : 'lib'
  })

  let promise4: Promise<any> = Promise.resolve()

  const tsSrc = [`${srcDir}/**/*.ts?(x)`, `!${srcDir}/**/{test,doc}/**`]
  const tsConfigFile = getProjectPath('tsconfig.json')
  // 判断是否存在tsconfig
  if (checkTsCondition(tsSrc, tsConfigFile)) {
    promise4 = compileTs(tsSrc, dest, {
      target: isEs ? 'es' : 'lib',
      tsConfigFile
    })
  }
  return Promise.all([promise3, promise4])
}
