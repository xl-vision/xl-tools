const compileScss = require('../lib/compileScss')
const getConfig = require('../utils/getConfig')

const build = async (isEs) => {

  const srcDir = getConfig('srcDir')
  const esDir = getConfig('esDir')
  const libDir = getConfig('libDir')

  const src = [`${srcDir}/**/*.scss`, '!**/{doc,test}/**']
  const dest = isEs ? esDir : libDir
  await compileScss({
    src,
    dest,
    beautify: true
  })
}

module.exports = async () => {
  await build()
  await build(true)
}
