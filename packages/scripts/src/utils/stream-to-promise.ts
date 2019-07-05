import { Stream } from "stream";

const streamToPromise = (stream: Stream) => {
  return new Promise((resolve, reject) => {
    stream.on('error', reject)
    stream.on('finish', resolve)
  })
}

export default (...streams: Stream[])  => {
  return Promise.all(streams.map(it => streamToPromise(it)))
}