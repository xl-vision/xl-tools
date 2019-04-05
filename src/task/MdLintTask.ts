import gulp from 'gulp'
// import markdownlint from 'markdownlint'
import path from 'path'
import through2 from 'through2'
import Task, { promisefyStream } from './Task'

export interface Props {
  src: string[]
  configPath: string
}

const defaultProps: Props = {
  configPath: path.resolve(__dirname, '../../config/mdlint.config.js'),
  src: ['src/**/*.md', 'site/**/*.md']
}

const MdLintTask: Task<Partial<Props> | undefined> = (props) => {
  const { src } = { ...defaultProps, ...props }
  // const config = markdownlint.readConfigSync(configPath)
  const stream = gulp.src(src).pipe(
    through2.obj((
      file,
      // @ts-ignore
      enc,
      cb
    ) => {
      const filepath = file.path
      console.log(filepath)
      cb()
    })
  )

  return promisefyStream(stream)
}

export default MdLintTask
