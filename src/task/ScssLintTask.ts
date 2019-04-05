import gulp from 'gulp'
import gulpStylelint from 'gulp-stylelint'
import path from 'path'
import Task, { promisefyStream } from './Task'

export interface Props {
  src: string[]
  configPath: string
}

const defaultProps: Props = {
  configPath: path.resolve(__dirname, '../../config/scsslint.config.js'),
  src: ['src/**/*.scss', 'site/**/*.scss']
}

const ScssLintTask: Task<Partial<Props>> = (props) => {
  const { src, configPath } = { ...defaultProps, ...props }
  const stream = gulp.src(src).pipe(
    gulpStylelint({
      configFile: configPath,
      reporters: [
        {
          console: true,
          formatter: 'verbose'
        }
      ],
      syntax: 'scss'
    })
  )
  return promisefyStream(stream)
}
export default ScssLintTask
