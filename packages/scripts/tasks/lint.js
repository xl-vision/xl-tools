const lintStyle = require('../lib/lintStyle')
const lintScript = require('../lib/lintScript')
const getConfig = require('../utils/getConfig')

module.exports = async () => {
  const srcDir = getConfig('srcDir')
  const siteDir = getConfig('siteDir')
  const styleSuffix = '{scss}'
  const styleSrc = [`{${srcDir}, ${siteDir}/**/*.${styleSuffix}`]
  await lintStyle({
    src: styleSrc
  })

  const scriptSuffix = '{js?(x), tx?(x)}'
  const scriptSrc = [`{${srcDir}, ${siteDir}/**/*.${scriptSuffix}`]
  await lintScript({
    src: scriptSrc
  })
}
