const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const chalk = require('chalk')

function runWebpack (config, isServer) {
  const compiler = webpack(config)
  const promise = new Promise((resolve, reject) => {
    if (isServer) {
      const devServer = new WebpackDevServer(compiler, {
        compress: true,
        clientLogLevel: 'none',
        contentBase: false,
        hot: true,
        publicPath: '/',
        historyApiFallback: true,
        stats: config.stats
      })
      devServer.listen(3000, 'localhost', err => {
        if (err) {
          reject(err)
          return
        }
        console.log(chalk.cyan('Starting the development server in port 3000\n'))
      })
      return
    }

    compiler.run((err, stats) => {
      if (err) {
        return reject(err)
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
