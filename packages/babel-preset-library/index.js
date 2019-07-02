module.exports = (context, options = {}) => {
  const presets = [
    require('@babel/preset-react')
  ]
  const plugins = [
    require('@babel/plugin-transform-runtime')
  ]

  let modules = false
  if(process.env.XL_TOOLS_TARGET === 'js' || process.env.XL_TOOLS_TARGET === 'site') {
    modules = 'commonjs'
  }

  presets.push([require('@babel/preset-env'), {
    modules
  }])

  if(process.env.XL_TOOLS_TARGET === 'site') {
    plugins.push(require('@babel/plugin-syntax-dynamic-import'))
  }

  if(process.env.XL_TOOLS_TYPESCRIPT) {
    presets.push(require('@babel/preset-typescript'))
  }

  return {
    presets,
    plugins
  }
}