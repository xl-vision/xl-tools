const buildScript = require('./buildScript')
const buildStyle = require('./buildStyle')

module.exports = async () => {
  await buildStyle()
  await buildScript()
}
