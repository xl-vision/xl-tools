const path = require('path')

module.exports = (context, options = {}) => {
  const presets = [
    require.resolve('@babel/preset-react')
  ]
  const plugins = [
    require.resolve('@babel/plugin-transform-runtime')
  ]

  let modules = false
  if(process.env.XL_TOOLS_TARGET !== 'es') {
    modules = 'commonjs'
  }

  presets.push([require.resolve('@babel/preset-env'), {
    modules
  }])

  if(process.env.XL_TOOLS_TARGET === 'site') {
    plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'))
  }

  if(process.env.XL_TOOLS_SCRIPT_LANG === 'typescript') {
    presets.push(require.resolve('@babel/preset-typescript'))
  }

  return {
    presets,
    plugins
  }
}