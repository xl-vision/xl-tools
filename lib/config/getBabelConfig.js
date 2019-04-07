module.exports = ({modules = 'auto', typescript = false}) => {
    //confirm '@babel/runtime' is installed
    try {
        require.resolve('@babel/runtime/package.json')
    } catch (err) {
        throw new Error('the module \'@babel/runtime\' doesn\'t exist, please install it with command: \'npm i @babel/runtime -S\'')
    }
    return {
        presets: [
            [require.resolve('@babel/preset-env'), {
                modules
            }],
            require.resolve('@babel/preset-react'),
            typescript && require.resolve('@babel/preset-typescript')
        ],
        plugins: [
            require.resolve('@babel/plugin-transform-runtime')
        ]
    }
}