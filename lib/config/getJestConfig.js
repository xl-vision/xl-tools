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
            "**/src/scripts/**/test/index.ts?(x)"
        ],
        // collectCoverage: true,
        collectCoverageFrom: [
            'src/scripts/**/*.{ts,tsx}',
            '!src/scripts/**/test/*.{ts,tsx}',
            '!src/scripts/**/doc/*.{ts,tsx}',
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