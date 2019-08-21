import compileScss from "../lib/compileScss"
import copy from "../lib/copy"

export default () => {
  const dest = 'style'
  const srcDir = 'src'
  const scssSrc = [`${srcDir}/**/*.scss`, `!${srcDir}/**/{test,doc}/**`]
  const promise1 = compileScss(scssSrc, dest, {beautify: true})

  const promise2 = copy(scssSrc, dest)
  return Promise.all([promise1, promise2])
}
