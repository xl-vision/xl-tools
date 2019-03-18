const path = require('path')

const resolve = (...dir) => path.join(__dirname, ...dir)

module.exports = ({ tsConfig }) => {
    return {
        preset: 'ts-jest',
        // testEnvironment: 'node',
        // setupFiles: [
        //     resolve("./setup.js")
        // ],
        testMatch: [
            "**/src/**/test/index.ts?(x)"
        ],
        // collectCoverage: true,
        collectCoverageFrom: [
            'src/**/*.{ts,tsx}',
            '!src/**/test/*.{ts,tsx}',
            '!src/**/doc/*.{ts,tsx}',
        ],
        snapshotSerializers: [
            'enzyme-to-json/serializer',
        ],
        globals: {
            'ts-jest': {
                tsConfig,
                diagnostics: true
            }
        },
        testURL: 'http://localhost',
    }
}