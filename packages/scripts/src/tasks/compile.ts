import compileScss from "../lib/compileScss";
import copy from "../lib/copy";
import compileJs from "../lib/compileJs";
import compileTs from "../lib/compileTs";

export default async () => {
  await compileAll(true)
  await compileAll()
}

const compileAll = async (isEs = false) => {
  process.env.XL_TOOLS_TARGET = isEs ? 'es' : 'lib'
  const dest = isEs ? 'es' : 'lib'
  const srcDir = 'src'
  const scssSrc = [`${srcDir}/**/*.scss`, `!${srcDir}/**/{test,doc}/**`]
  await compileScss(scssSrc, dest, {beautify: true})
  await copy(scssSrc, dest)

  process.env.XL_TOOLS_SCRIPT_LANG = 'javascript'
  const jsSrc = [`${srcDir}/**/*.js?(x)`, `!${srcDir}/**/{test,doc}/**`]
  await compileJs(jsSrc, dest)

  process.env.XL_TOOLS_SCRIPT_LANG = 'typescript'
  const tsSrc = [`${srcDir}/**/*.ts?(x)`, `!${srcDir}/**/{test,doc}/**`]
  await compileTs(tsSrc, dest)
}