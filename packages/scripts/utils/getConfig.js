const getProjectPath = require('./getProjectPath')

let config = {
  sourceDir: 'src',
  siteDir: 'site',
  esDir: 'es',
  libDir: 'lib',
}

try {
  const configFile = require.resolve(getProjectPath('xl-tools.config.js'))
  if(typeof configFile === 'function') {
    config = Object.assign(config, configFile())
  } else {
    config = Object.assign(config, configFile)
  }
} catch(e){}

module.exports = (key) => {
  return typeof key === 'undefined' ? config : config[key]
}