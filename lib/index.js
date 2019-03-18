#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')
const fs = require('fs')
const { getProjectPath } = require('./utils/projectHelper')
const message = require('./utils/message')
const compileTs = require('./tasks/compileTs')
const compileScss = require('./tasks/compileScss')
const webpack = require('./tasks/webpack')
const tslint = require('./tasks/tslint')

const tsConfigFile = 'tsconfig.json'
const babelConfigFile = 'babel.config.js'
const postcssConfigFile = 'postcss.config.js'
const webpackConfigFile = 'webapck.config.js'
const tslintConfigFile = 'tslint.json'

const checkFile = file => {
    const path = getProjectPath(file)
    if (!fs.existsSync(path)) {
        throw new Error(`the file '${file}' doesn't exist`)
    }
}

const splitToArray = str => str.split(',')

const getConfig = (file, defaultFile) => {
    if (file) {
        checkFile(file)
    }
    let config
    const filePath = getProjectPath(file || defaultFile)
    if (fs.existsSync(filePath)) {
        config = require(filePath)
    }
    return config
}



const action = program.action
const actionWrap = function (fn) {
    const wrap = async function () {
        const name = this.name()
        message.success(`command: '${name}' is started`)
        const start = Date.now()
        try {
            await fn.apply(this, arguments)
            message.success(`command: '${name}' is ended, expended time: ${Date.now() - start}ms`)
        } catch (err) {
            message.error(`command: '${name}' is failed!`)
            message.error(err)
            process.exit(1)
        }
    }
    action.call(this, wrap)
}
program.Command.prototype.action = actionWrap

program
    .version(pkg.version)
    .description('Scaffolding used by xl-vision')

program
    .command('compile:ts')
    .description('Compile ts files')
    .option('--tsConfig <path>', `Specify typescript config file, default is '${tsConfigFile}' if exists`)
    .option('--babelConfig <path>', `Specify babel config file, default is '${babelConfigFile}' if exists`)
    .option('--src <path>', `The source files`, 'src/**/*.ts?(x), !src/**/test/*.ts?(x)')
    .option('--dest <path>', `The destination directory, default is the same as option '--modules'`)
    .option('--modules <modules>', `Enable transformation of ES6 module syntax to another module type`, /^(js|es)$/i, 'js')
    .action(function (options) {
        const tsConfig = getConfig(options.tsConfig, tsConfigFile)
        const babelConfig = getConfig(options.babelConfig, babelConfigFile)
        const src = splitToArray(options.src)
        const modules = options.modules === 'es' ? false : 'auto'
        const dest = options.dest || options.modules
        return compileTs({ src, dest, tsConfig, babelConfig, modules })
    })


program
    .command('compile:scss')
    .description('Compile scss files')
    .option('--postcssConfig <path>', `Specify postcss config file, default is '${postcssConfigFile}' if exists`)
    .option('--src <path>', `The source files`, 'src/**/*.scss, !src/**/test/*.scss')
    .option('--dest <path>', `The destination directory`, 'style')
    .option('--beautify', `Beautify the result`)
    .action(function (options) {
        const postcssConfig = getConfig(options.postcssConfig, postcssConfigFile)
        const src = splitToArray(options.src)
        const dest = options.dest
        const beautify = options.beautify
        return compileScss({ src, dest, postcssConfig, beautify })
    })

program
    .command('webpack')
    .description('Build file with webpack')
    .option('-webpackConfig <path>', `Specify postcss config file, default is '${webpackConfigFile}' if exists`)
    .option('--env <path>', `Configrate environment variable`, /^(development|production)$/i, 'production')
    .option('--tsConfig <path>', `Specify typescript config file, default is '${tsConfigFile}' if exists`)
    .option('--babelConfig <path>', `Specify babel config file, default is '${babelConfigFile}' if exists`)
    .option('--postcssConfig <path>', `Specify postcss config file, default is '${postcssConfigFile}' if exists`)
    .option('--entry <path>', `Specify the entry file`, 'src')
    .option('--output <path>', `Specify the output directory`, 'dist')
    .action(function (options) {
        const webpackConfig = getConfig(options.webpackConfig, webpackConfigFile)
        const tsConfig = getConfig(options.tsConfig, tsConfigFile)
        const babelConfig = getConfig(options.babelConfig, babelConfigFile)
        const postcssConfig = getConfig(options.postcssConfig, postcssConfigFile)
        const env = options.env
        const entry = getProjectPath(options.entry)
        const output = getProjectPath(options.output)
        return webpack({ webpackConfig, tsConfig, babelConfig, postcssConfig, env, entry, output })
    })

program
    .command('tslint')
    .description('Run tslint')
    .option('--src <path>', `The source files`, 'src/**/*.ts?(x), !src/**/test/*.ts?(x)')
    .option('--tslintConfig <path>', `Specify tslint config file, default is '${tslintConfigFile}' if exists`)
    .action(function (options) {
        let tslintConfigPath
        try {
            getConfig(options.tslintConfig, tslintConfigFile)
        } catch (err) {
            tslintConfigPath = getProjectPath(options.tslintConfig || tslintConfigFile)
        }
        const src = splitToArray(options.src)
        return tslint({ tslintConfigPath, src })
    })


program.parse(process.argv)
