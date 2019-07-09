import compileScss from "../lib/compileScss"
import copy from "../lib/copy"
import compileJs from "../lib/compileJs"
import compileTs from "../lib/compileTs"

export default () => {
  return compileAll(true)
}

export const compileAll = (isEs = false) => {
  const dest = isEs ? 'es' : 'lib'
  const srcDir = 'src'
  const scssSrc = [`${srcDir}/**/*.scss`, `!${srcDir}/**/{test,doc}/**`]
  const promise1 = compileScss(scssSrc, dest, {beautify: true})

  const promise2 = copy(scssSrc, dest)

  const jsSrc = [`${srcDir}/**/*.js?(x)`, `!${srcDir}/**/{test,doc}/**`]
  const promise3 = compileJs(jsSrc, dest, {
    target: isEs ? 'es' : 'lib'
  })

  const tsSrc = [`${srcDir}/**/*.ts?(x)`, `!${srcDir}/**/{test,doc}/**`]
  const promise4 = compileTs(tsSrc, dest, {
    target: isEs ? 'es' : 'lib'
  })

  return Promise.all([promise1, promise2, promise3, promise4])
}
