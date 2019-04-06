const mdlint = require('../src/task/mdlint')
const scsslint = require('../src/task/scsslint')
const tslint = require('../src/task/tslint')

describe('test tasks', () => {
    it('test mdlint', () => {
        expect.assertions(1)
        return mdlint({
            cwd: __dirname,
            src: 'files/mdlint.md'
        }).catch(err => {
            expect(err.message.replace(/.*mdlint.md/g, '')).toMatchSnapshot()
        })
    })

    it('test scsslint', () => {
        expect.assertions(1)
        return scsslint({
            cwd: __dirname,
            src: 'files/scsslint.scss'
        }).catch(err => {
            expect(err.message).toMatchSnapshot()
        })
    })

    it('test tslint', () => {
        expect.assertions(1)
        return tslint({
            cwd: __dirname,
            src: 'files/tslint.ts'
        }).catch(err => {
            expect(err.message.replace(/:.*tslint.ts/g, '')).toMatchSnapshot()
        })
    })

})