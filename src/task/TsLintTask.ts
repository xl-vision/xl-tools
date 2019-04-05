import gulp from 'gulp'
import gulpTslint from 'gulp-tslint'
import path from 'path'
import tslint from 'tslint'
import Task, { promisefyStream } from './Task'

export interface Props {
  src?: string[]
  configPath: string
}

const defaultProps = {
  configPath: path.resolve(__dirname, '../../config/tslint.json'),
  src: ['src/**/*.ts?(x)', 'site/**/*.ts?(x)']
}

const TsLintTask: Task<Partial<Props>> = (props) => {
  const { src, configPath } = { ...defaultProps, ...props }
  const program = tslint.Linter.createProgram(configPath, process.cwd())
  const stream = gulp
    .src(src)
    .pipe(
      gulpTslint({
        formatter: 'verbose',
        program
      })
    )
    .pipe(gulpTslint.report())
  return promisefyStream(stream)
}

export default TsLintTask
