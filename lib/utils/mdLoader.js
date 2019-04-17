const frontMatter = require('front-matter')
const highlight = require('highlight.js')
const MarkdownIt = require('markdown-it')
const MarkdownItContainer = require('markdown-it-container')
const loaderUtils = require('loader-utils')

// 前置内容
let prefixContent = []
let clsPrefix = 'md'

let fnIndex = 0

const md = new MarkdownIt({
  linkify: true,
  typographer: true,
  xhtmlOut: true,
  html: true,
  highlight (content, languageHint) {
    let highlightedContent

    highlight.configure({
      useBR: true,
      tabReplace: '  '
    })

    if (languageHint && highlight.getLanguage(languageHint)) {
      try {
        highlightedContent = highlight.highlight(languageHint, content).value
      // eslint-disable-next-line no-empty
      } catch (err) {}
    }

    if (!highlightedContent) {
      try {
        highlightedContent = highlight.highlightAuto(content).value
      // eslint-disable-next-line no-empty
      } catch (err) {}
    }

    // 把代码中的{}转
    highlightedContent = highlightedContent.replace(/[{}]/g, (match) => `{'${match}'}`)

    // 加上 hljs
    highlightedContent = highlightedContent.replace('<code class="', '<code class="hljs ').replace('<code>', '<code class="hljs">')

    return highlight.fixMarkup(highlightedContent)
  }
})

md.renderer.rules.table_open = () => `<table class="${clsPrefix}_table">`
md.renderer.rules.ordered_list_open = () => `<ol class="${clsPrefix}_ordered_list">`
md.renderer.rules.bullet_list_open = () => `<ul class="${clsPrefix}_bullet_list">`
md.renderer.rules.blockquote_open = () => `<blockquote class="${clsPrefix}_blockquote">`
md.renderer.rules.link_open = (tokens, idx) => {
  const token = tokens[idx]
  const href = token.attrGet('href')
  return `<a href="${href}" class="${clsPrefix}_a">`
}
const defaultCodeInlineRender = md.renderer.rules.code_inline
md.renderer.rules.code_inline = function (tokens, idx, options, env, self) {
  var index = tokens[idx].attrIndex('class')
  if (index > -1) {
    tokens[idx].attrs[index][1] += ` ${clsPrefix}_code_inline`
  } else {
    tokens[idx].attrPush(['class', `${clsPrefix}_code_inline`])
  }
  return defaultCodeInlineRender(tokens, idx, options, env, self)
}
const defaultLinkOpenRender = md.renderer.rules.fence
md.renderer.rules.fence = function (tokens, idx, options, env, self) {
  var index = tokens[idx].attrIndex('class')
  if (index > -1) {
    tokens[idx].attrs[index][1] += ` ${clsPrefix}_fence`
  } else {
    tokens[idx].attrPush(['class', `${clsPrefix}_fence`])
  }
  return defaultLinkOpenRender(tokens, idx, options, env, self)
}

// 处理文本中{}
const textFn = md.renderer.rules.text
md.renderer.rules.text = function () {
  const ret = textFn.apply(this, arguments)
  // return `{\`${ret.replace(/`/g, "\\`")}\`}`
  return ret.replace(/[{}]/g, (match) => `{'${match}'}`)
}

md.use(MarkdownItContainer, 'demo', {
  validate: function (params) {
    return params.trim().match(/^demo\s*(.*)$/)
  },
  render: function (tokens, idx) {
    const m = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
    if (tokens[idx].nesting === 1) {
      const title = md.renderInline(m[1])
      const desc = md.renderInline(tokens[idx + 2].content)
      const code = tokens[idx + 4].content

      // 删除多余的desc
      tokens[idx + 2].content = ''
      tokens[idx + 2].children = []

      const fnName = `Demo_${fnIndex++}`
      // 加入到前置内容中
      const formatCode = code.replace(/ *export +default/, ` const ${fnName} = `)
      prefixContent.push(formatCode)

      return `<DemoBox view={<${fnName}/>} title={<div>${title}</div>} desc={<div>${desc}</div>}>`
    }
    return '</DemoBox>'
  }
})

function renderModule (jsx) {
  const content = `
  ${prefixContent.join('\n')}
  function MarkdownLoader() {
    return(
      <div className="${clsPrefix}">
        ${jsx}
      </div>
    )
  }

  export default MarkdownLoader
  `
  return content
}

module.exports = function (source) {
  const options = loaderUtils.getOptions(this)
  const mdCodeComponentPath = options.mdCodeComponentPath.replace(/\\/g, '\\\\')
  clsPrefix = options.clsPrefix || 'md'
  fnIndex = 0
  prefixContent = ['import React from "react"', `import DemoBox from "${mdCodeComponentPath}"`, 'import "highlight.js/styles/github.css"']
  this.cacheable()

  // 处理imports
  let {
    body,
    attributes: {
      imports
    }
  } = frontMatter(source)
  if (!Array.isArray(imports)) {
    imports = [imports]
  }

  prefixContent = prefixContent.concat(imports)

  // render
  let content = md.render(body)
    .replace(/<hr>/g, '<hr />')
    .replace(/<br>/g, '<br />')
    .replace(/class *=/g, 'className=')

  // 生成组件
  return renderModule(content)
}
