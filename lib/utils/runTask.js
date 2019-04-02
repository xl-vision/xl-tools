const promisefyStream = stream => {
    return new Promise((resolve, reject) => {
        stream.on('end', () => {
            resolve()
        })
        stream.on('error', function (error) {
            reject(error)
        })
    })
}

module.exports = {
    promisefyStream
}