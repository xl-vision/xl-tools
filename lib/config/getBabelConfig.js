module.exports = ({modules = 'auto'}) => {
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
        ],
        plugins: [
            require.resolve('@babel/plugin-transform-runtime')
        ]
    }
}