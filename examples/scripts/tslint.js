const gulp = require('gulp')
const tslint = require('../../lib/task/tslint')
gulp.task('tslint', tslint)

const instance = gulp.task('tslint')
instance.apply(gulp)