const getTarget = () => {
  const target = (process.env.XL_TOOLS||{}).target
  return target
}

const setTarget = (target) => {
  process.env.XL_TOOLS = process.env.XL_TOOLS || {}
  process.env.XL_TOOLS.target = target
}

const TARGET_SITE = 'site'
const TARGET_LIB = 'lib'
const TARGET_ES = 'es'

module.exports = {
  getTarget,
  setTarget,
  TARGET_SITE,
  TARGET_LIB,
  TARGET_ES
}