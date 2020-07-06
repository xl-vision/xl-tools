export type Lang =
  | 'ts'
  | 'tsx'
  | 'js'
  | 'jsx'
  | 'css'
  | 'scss'
  | 'sass'
  | 'less'
  | 'stylus'

export type Block = { lang: Lang; content: string }

export const getCodeBlock = (
  content: string,
  demoContainer: string = 'demo'
) => {
  const regex = new RegExp(`^:::[\t\f ]*${demoContainer}[\t\f ]*(?<title>.*?)$`)

  let lines = content.split(/\r?\n/)

  let startLine = 0
  for (; startLine < lines.length; startLine++) {
    if (lines[startLine].startsWith(':::')) {
      break
    }
  }
  // 没找到开始标签:::
  if (startLine === lines.length) {
    return
  }

  const m = regex.exec(lines[startLine])
  if (!m) {
    return
  }

  const title = m.groups?.title

  let endLine = startLine + 1

  for (; endLine < lines.length; endLine++) {
    const line = lines[endLine]
    if (line === ':::') {
      break
    }
  }

  // 没找到结束标签:::
  if (endLine >= lines.length) {
    return
  }

  // 寻找desc范围
  const descStartLine = startLine + 1 // +1因为第一行是:::
  let descEndLine = descStartLine

  for (; descEndLine < endLine - 1; descEndLine++) {
    const line = lines[descEndLine]
    if (line.startsWith('```')) {
      break
    }
  }

  const desc = lines.slice(descStartLine, descEndLine).join('\n')

  const blocks = getBlocks(lines, descEndLine, endLine - 1) // -1因为最后一行是:::

  const prevLines = lines.slice(0, startLine)
  const matchLines = lines.slice(startLine, endLine + 1)
  const nextLines = lines.slice(endLine + 1)

  return {
    title,
    desc,
    blocks,
    startLine: startLine + 1, // 从1计数
    endLine: endLine + 1, // 从1计数
    mergedBlocks: mergeBlocks(blocks),
    prevContent: prevLines.join('\n'),
    matchContent: matchLines.join('\n'),
    nextContent: nextLines.join('\n'),
  }
}

const getBlocks = (
  lines: Array<string>,
  startLine: number,
  endLine: number
) => {
  let started = -1
  let lang: any = ''
  const blocks: Array<Block> = []
  for (let i = startLine; i <= endLine; i++) {
    const line = lines[i]
    if (line.startsWith('```')) {
      if (started === -1) {
        started = i
        lang = line.substring(3).trim()
      } else {
        const content = lines.slice(started + 1, i).join('\n')

        blocks.push({
          lang,
          content,
        })

        started = -1
      }
    }
  }
  if (started !== -1) {
    throw new Error(
      `The block between line ${
        startLine + started
      } and line ${endLine} does not have closing tag '\`\`\`'`
    )
  }

  return blocks
}

const mergeBlocks = (blocks: Array<Block>) => {
  const newBlocks: Array<Block> = []
  for (const block of blocks) {
    let lang = block.lang
    if (lang === 'js') {
      lang = 'jsx'
    } else if (lang === 'ts') {
      lang = 'tsx'
    }
    const matchedBlocks = newBlocks.filter((it) => it.lang === lang)
    if (matchedBlocks.length > 0) {
      matchedBlocks[0].content += `\n${block.content}`
    } else {
      newBlocks.push({ lang, content: block.content })
    }
  }
  return newBlocks
}
