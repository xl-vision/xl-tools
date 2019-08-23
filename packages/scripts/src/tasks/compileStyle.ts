import compileScss from "../lib/compileScss"
import copy from "../lib/copy"
import { STYLE_DIR, SOURCE_DIR } from "./entry";

export default () => {
  const dest = STYLE_DIR
  const scssSrc = [`${SOURCE_DIR}/**/*.scss`, `!${SOURCE_DIR}/**/{test,doc}/**`]
  const promise1 = compileScss(scssSrc, dest, {beautify: true})

  const promise2 = copy(scssSrc, dest)
  return Promise.all([promise1, promise2])
}
