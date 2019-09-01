import Webpack from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import chalk from 'chalk'
import getPublicAddress from './getPublicAddress'
import getPort from './getPort'

const publicAddress = getPublicAddress()

const HOST = '0.0.0.0'

function runWebpack(config: Webpack.Configuration, devServerConfig?: WebpackDevServer.Configuration) {
  const promise = new Promise((resolve, reject) => {
    const compiler = Webpack(config)

    if (devServerConfig) {
      const defaultPort = devServerConfig.port || 3000

      getPort(HOST, defaultPort)
        .then(port => {
          if (port === null) {
            return reject('Could not find a port.')
          }
          console.info(chalk.cyan(`You are now in dev server mode.`))
          console.info(chalk.cyan(`Starting the development server in port:${port}\n`))

          const devConfig = {
            ...devServerConfig,
            port,
            noInfo: true
          }

          const isHttps = !!devServerConfig.https
          WebpackDevServer.addDevServerEntrypoints(config, devConfig)
          const devServer = new WebpackDevServer(compiler, devConfig)
          devServer.listen(port, HOST, err => {
            if (err) {
              console.error('error', err)
              return reject(err)
            }
            console.info(chalk.cyan(`Started server in address: http${isHttps ? 's' : ''}:${HOST === '0.0.0.0' ? 'localhost' : HOST}:${port}`))
            if (publicAddress) {
              console.info(chalk.cyan(`You can also open with public address: http${isHttps ? 's' : ''}:${publicAddress}:${port}\n`))
            }
            resolve()
          })
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
