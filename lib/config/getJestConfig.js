module.exports = ({ tsConfig }) => {
    return {
        preset: 'ts-jest',
        // testEnvironment: 'node',
        // setupFiles: [
        //     resolve("./setup.js")
        // ],
        testMatch: [
            "**/src/scripts/**/_test/index.ts?(x)"
        ],
        // collectCoverage: true,
        collectCoverageFrom: [
            'src/scripts/**/*.{ts,tsx}',
            '!src/scripts/**/_*/**',
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