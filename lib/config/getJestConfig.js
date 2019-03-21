module.exports = ({ tsConfig }) => {
    return {
        preset: 'ts-jest',
        // testEnvironment: 'node',
        // setupFiles: [
        //     resolve("./setup.js")
        // ],
        testMatch: [
            "**/src/package/**/_test/index.ts?(x)"
        ],
        // collectCoverage: true,
        collectCoverageFrom: [
            'src/package/**/*.{ts,tsx}',
            '!src/package/**/_*/**',
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