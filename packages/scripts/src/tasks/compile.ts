import compileScss from "../lib/compileScss"
import copy from "../lib/copy"
import compileJs from "../lib/compileJs"
import compileTs from "../lib/compileTs"

export default async () => {
  await compileAll(true)
  await compileAll()
}

const compileAll = async (isEs = false) => {
  const dest = isEs ? 'es' : 'lib'
  const srcDir = 'src'
  const scssSrc = [`${srcDir}/**/*.scss`, `!${srcDir}/**/{test,doc}/**`]
  await compileScss(scssSrc, dest, {beautify: true})
  await copy(scssSrc, dest)

  const jsSrc = [`${srcDir}/**/*.js?(x)`, `!${srcDir}/**/{test,doc}/**`]
  await compileJs(jsSrc, dest, {
    target: isEs ? 'es' : 'lib'
  })

  const tsSrc = [`${srcDir}/**/*.ts?(x)`, `!${srcDir}/**/{test,doc}/**`]
  await compileTs(tsSrc, dest, {
    target: isEs ? 'es' : 'lib'
  })
}
