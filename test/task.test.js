const lintMd = require('../src/task/lintMd')
const lintScss = require('../src/task/lintScss')
const lintTs = require('../src/task/lintTs')

describe('test tasks', () => {
    it('test lintMd', () => {
        expect.assertions(1)
        return lintMd({
            cwd: __dirname,
            src: 'files/lintMd.md'
        }).catch(err => {
            expect(err.message.replace(/.*lintMd.md/g, '')).toMatchSnapshot()
        })
    })

    it('test lintScss', () => {
        expect.assertions(1)
        return lintScss({
            cwd: __dirname,
            src: 'files/lintScss.scss'
        }).catch(err => {
            expect(err.message).toMatchSnapshot()
        })
    })

    it('test lintTs', () => {
        expect.assertions(1)
        return lintTs({
            cwd: __dirname,
            src: 'files/lintTs.ts'
        }).catch(err => {
            expect(err.message.replace(/:.*lintTs.ts/g, '')).toMatchSnapshot()
        })
    })

})