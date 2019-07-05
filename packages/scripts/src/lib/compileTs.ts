import gulp from 'gulp'
import gulpBabel from 'gulp-babel'
import gulpTypescript from 'gulp-typescript'
import getProjectPath from '../utils/getProjectPath';
import streamToPromise from '../utils/stream-to-promise';


const reporter = gulpTypescript.reporter.defaultReporter()

const overwriteConfig = {
  declaration: true,
  module: 'ESNext'
}

export default (from: string | string[], to: string) => {
  const tsProject = gulpTypescript.createProject(getProjectPath('tsconfig.json'), overwriteConfig)

  const tsResult = gulp.src(from)
    .pipe(tsProject({
      error (err, ts) {
        throw err
      },
      finish: reporter.finish
    }))

  const dts = tsResult.dts.pipe(gulp.dest(to))
  const js = tsResult.js.pipe(gulpBabel()).pipe(gulp.dest(to))

  return streamToPromise(dts, js)
}
