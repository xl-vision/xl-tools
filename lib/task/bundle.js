const rollup = require('rollup')
// const rollupPluginTypescript = require('rollup-plugin-typescript')
const rollupPluginBabel = require('rollup-plugin-babel')
const rollupPluginJson = require('rollup-plugin-json')


module.exports = ({
    input,
    output,
    name = 'library',
    babelConfig,
    // tsConfig
}) => {
    if(typeof babelConfig == 'string'){
        babelConfig = require(babelConfig)
    }
    const babel = rollupPluginBabel({
        ...babelConfig,
        extensions: ['.js','.jsx','.ts','.tsx']
    }) 

    const json = rollupPluginJson({
        preferConst: true
    })
    return rollup.rollup({
        input,
        plugins:[
            babel,
            json
        ],
        external: ['react','react-dom']
    }).then(bundle => {
        return bundle.write({
            output,
            format:'umd',
            name,
            sourcemap: true
        })
    })
}