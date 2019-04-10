const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')

function runWebpack (config, isServer) {
  const promise = new Promise((resolve, reject) => {
    if (isServer) {
      const port = config.devServer.port || 3000
      WebpackDevServer.addDevServerEntrypoints(config, {
        ...config.devServer,
        port
      })
      const compiler = webpack(config)
      const devServer = new WebpackDevServer(compiler, config.devServer)
      devServer.listen(port, err => {
        if (err) {
          return reject(err.details || err.stack || err)
        }
        console.info(chalk.cyan(`Starting the development server in port ${port}\n`))
      })
      return
    }

    const compiler = webpack(config)
    compiler.run((err, stats) => {
      if (err) {
        return reject(err.details || err.stack || err)
      }
      const info = stats.toJson()
      if (stats.hasErrors()) {
        return reject(info.errors)
      }

      const buildInfo = stats.toString(Object.assign({
        colors: true,
        children: true,
        chunks: false,
        modules: false,
        chunkModules: false,
        hash: false,
        version: false
      }, config.stats))
      console.info(buildInfo)
      return resolve()
    })
  })

  return promise
}

module.exports = runWebpack
