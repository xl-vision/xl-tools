import { Stream } from 'stream'

type Task<P extends {}> = (props: P) => Promise<void>

export default Task

export const promisefyStream = (stream: Stream) => {
  return new Promise<void>((resolve, reject) => {
    stream.on('end', () => {
      resolve()
    })
    stream.on('error', (error) => {
      reject(error)
    })
  })
}
