import gulp from 'gulp'
import gulpTs from 'gulp-typescript'
import gulpBabel from 'gulp-babel'

const reporter = gulpTs.reporter.defaultReporter()

export type Options = {
  src: string | string[]
  dest: string
}

const compileTs = ({
  src,
  dest
}: Options) => {

}

export default compileTs