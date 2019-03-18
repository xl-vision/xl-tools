#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')
const message = require('./utils/message')
const compileTs = require('./tasks/compileTs')
const compileScss = require('./tasks/compileScss')
const webpack = require('./tasks/webpack')
const tslint = require('./tasks/tslint')
const test = require('./tasks/test')

const tsConfigFile = 'tsconfig.json'
const babelConfigFile = 'babel.config.js'
const postcssConfigFile = 'postcss.config.js'
const webpackConfigFile = 'webapck.config.js'
const tslintConfigFile = 'tslint.json'
const jestConfigFile = 'jest.config.js'


const splitToArray = str => str.split(',')


const parseOptions = options => {
    if (!options) {
        return {}
    }
    let o = {}
    // if (options.parent) {
    //     o = parseOptions(options.parent.Command)
    // }

    Object.keys(options).filter(key => {
        if (key.startsWith('_')) {
            return false
        }
        if (key === 'commands' || key === 'options' || key === 'parent') {
            return false
        }
        return true
    }).forEach(key => {
        o[key] = options[key]
    })
    return o
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
    .option('--src <path>', `The source files`, splitToArray)
    .option('--dest <path>', `The destination directory, default is the same as option '--modules'`)
    .option('--modules <modules>', `Enable transformation of ES6 module syntax to another module type`, /^(js|es)$/i)
    .action(function (options) {
        options = parseOptions(options)
        return compileTs(options)
    })


program
    .command('compile:scss')
    .description('Compile scss files')
    .option('--postcssConfig <path>', `Specify postcss config file, default is '${postcssConfigFile}' if exists`)
    .option('--src <path>', `The source files`, splitToArray)
    .option('--dest <path>', `The destination directory`)
    .option('--beautify', `Beautify the result`)
    .action(function (options) {
        options = parseOptions(options)
        return compileScss(options)
    })

program
    .command('webpack')
    .description('Build file with webpack')
    .option('-webpackConfig <path>', `Specify postcss config file, default is '${webpackConfigFile}' if exists`)
    .option('--env <path>', `Configrate environment variable`, /^(development|production)$/i)
    .option('--tsConfig <path>', `Specify typescript config file, default is '${tsConfigFile}' if exists`)
    .option('--babelConfig <path>', `Specify babel config file, default is '${babelConfigFile}' if exists`)
    .option('--postcssConfig <path>', `Specify postcss config file, default is '${postcssConfigFile}' if exists`)
    .option('--entry <path>', `Specify the entry file`)
    .option('--output <path>', `Specify the output directory`)
    .action(function (options) {
        options = parseOptions(options)
        return webpack(options)
    })

program
    .command('tslint')
    .description('Run tslint')
    .option('--src <path>', `The source files`,splitToArray)
    .option('--tslintConfig <path>', `Specify tslint config file, default is '${tslintConfigFile}' if exists`)
    .action(function (options) {
        options = parseOptions(options)
        return tslint(options)
    })


program
    .command('test')
    .description('Run Test')
    .option('--testMatch <path>', `The source files`, splitToArray)
    .option('--setupFiles <path>', `The setup files`,splitToArray)
    .option('--jestConfig <path>', `Specify jest config file, default is '${jestConfigFile}' if exists`)
    .option('--tsConfig <path>', `Specify typescript config file, default is '${tsConfigFile}' if exists`)
    .option('--collectCoverage', `Indicates whether the coverage information should be collected`)
    .action(function (options) {
        return test(parseOptions(options))
    })

program.parse(process.argv)
