const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')

function runWebpack (config, isServer) {
  const compiler = webpack(config)

  const promise = new Promise((resolve, reject) => {
    if (isServer) {
      const devServer = config.devServer || {}
      const port = devServer.port || 3000
      WebpackDevServer.addDevServerEntrypoints(config, {
        ...devServer,
        port
      })
      const devServer = new WebpackDevServer(compiler, config.devServer)
      devServer.listen(port, err => {
        if (err) {
          return reject(err.details || err.stack || err)
        }
        console.info(chalk.cyan(`Starting the development server in port ${port}\n`))
        resolve()
      })

      return
    }

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
      return resolve(buildInfo)
    })
  })
  return promise
}

module.exports = runWebpack
