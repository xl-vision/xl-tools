import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import chalk from 'chalk'

function runWebpack(config: Webpack.Configuration, devServerConfig?: WebpackDevServer.Configuration) {
  const promise = new Promise((resolve, reject) => {
    const compiler = Webpack(config)

    if (devServerConfig) {
      const port = devServerConfig.port || 3000
      WebpackDevServer.addDevServerEntrypoints(config, {
        ...devServerConfig,
        port
      })
      const devServer = new WebpackDevServer(compiler, devServerConfig)
      devServer.listen(port, err => {
        if (err) {
          console.error('error', err)
          return reject(err)
        }
        console.info(chalk.cyan(`Starting the development server in port ${port}\n`))
        resolve()
      })
      return
    }

    compiler.run((err, stats) => {
      if (err) {
        console.error('error', err)
        return reject(err)
      }
      const info = stats.toJson()
      if (stats.hasErrors()) {
        console.error('error', info.errors)
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

export default runWebpack
