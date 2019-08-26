import { Stream } from "stream"
import stp from 'stream-to-promise'

const streamToPromise = (stream: Stream) => {
  return stp(stream)
}

export default (...streams: Stream[])  => {
  return Promise.all(streams.map(it => streamToPromise(it)))
}
