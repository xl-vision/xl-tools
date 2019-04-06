const babel = require('@babel/core')
const globby = require('globby')
const path = require('path')
const fs = require('fs-extra')

async function build() {
    const src = path.join(__dirname, '../src')
    const dist = path.join(__dirname, '../dist')
    const filePaths = await globby(['**/*'], {
        cwd: src
    })
    for (const filePath of filePaths) {
        let content = await fs.readFile(path.join(src, filePath), 'utf-8')
        if (path.extname(filePath) === '.js') {
            content = await transform(content)
        }
        await fs.writeFile(path.join(dist, filePath), content)
    }
}

function transform(content) {
    return new Promise((resolved, rejectd) => {
        babel.transform(content, (err, ret) => {
            if (err) {
                rejectd(err)
                return
            }
            resolved(ret.code)
        })
    })
}

build()