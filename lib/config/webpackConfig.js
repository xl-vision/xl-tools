const webpack = require('webpack')
const pkg = require('../../package.json')
const WebpackBar = require('webpackbar')

module.exports = {
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    },
    entry: 'src/index.ts',
    output: {
        // path: getProjectPath('dist'),
        // publicPath: config.src.publicPath,
        // library: rootPkg.name,
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    externals: {
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDom',
        },
    },
    module: {
        rules: [
            //     {
            //     test: /\.tsx?$/,
            //     exclude: /node_modules/,
            //     enforce: 'pre',
            //     loader: 'tslint-loader',
            //     options: {
            //         configFile: tslintPath,
            //         tsConfigFile: tsconfigPath,
            //         // typeCheck: true,
            //     },
            // },
        ]
    },
    plugins: [
        new webpack.BannerPlugin(`
${pkg.name} v${pkg.version}

Copyright 2015-present, xl-vision, Inc.
All rights reserved.
        `),
        new WebpackBar({
            name: pkg.name
        })
    ]
}

