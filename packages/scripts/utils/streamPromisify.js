module.exports = stream => {
  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('end', resolve)
    stream.on('finish', resolve)
  })
}

const streamPromisify = 1

console.log(streamPromisify)
