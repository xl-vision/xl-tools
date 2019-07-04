const compileTs = require('../lib/compileTs')
const compileJs = require('../lib/compileJs')
const getConfig = require('../utils/getConfig')

const build = async (isEs) => {
  const srcDir = getConfig('srcDir')
  const esDir = getConfig('esDir')
  const libDir = getConfig('libDir')
  const dest = isEs ? esDir : libDir

  const tsSrc = [`${srcDir}/**/*.ts?(x)`, '!**/{doc,test}/**']

  await compileTs({
    src: tsSrc,
    dest,
    isEs
  })

  const jsSrc = [`${srcDir}/**/*.js?(x)`, '!**/{doc,test}/**']

  await compileJs({
    src: jsSrc,
    dest,
    isEs
  })
}

module.exports = async () => {
  await build()
  await build(true)
}
