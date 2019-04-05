const gulp = require('gulp')
const mdlint = require('../../lib/task/mdlint')
gulp.task('mdlint', mdlint)

const instance = gulp.task('mdlint')
instance.apply(gulp)