export type Block = { lang: string; content: string }

let regex: RegExp

export const getCodeBlock = (
  content: string,
  demoContainer: string = 'demo'
) => {
  if (!regex) {
    regex = new RegExp(`^:::[\t\f ]*${demoContainer}[\t\f ]*(?<title>.*?)$`)
  }

  let startLine = 1
  let endLine = 0

  let lines = content.split('\n')

  const prevLines = []

  while (lines.length > 0 && !lines[0].startsWith(':::')) {
    prevLines.push(lines[0])
    startLine++
    lines = lines.slice(1)
  }
  if (lines.length === 0) {
    return
  }
  const m = regex.exec(lines[0])
  if (!m) {
    return
  }

  const title = m.groups!.title

  const matchLines = []

  let depth = 0
  for (const line of lines) {
    if (/^:::[\t\f ]*\S+.*$/.exec(line)) {
      depth++
    } else if (line === ':::') {
      depth--
    }

    matchLines.push(line)

    if (depth !== 1) {
      break
    }
  }

  if (depth !== 0) {
    return
  }

  endLine = startLine + matchLines.length - 1

  const nextLines = lines.slice(matchLines.length)

  const body = matchLines.slice(1, matchLines.length - 1)

  let i = 0
  for (; i < body.length; i++) {
    const line = body[i]
    if (line.startsWith('```')) {
      break
    }
  }

  const desc = body.slice(0, i).join('\n')

  const blocks = getBlocks(body.slice(i))

  return {
    title,
    desc,
    blocks,
    startLine,
    endLine,
    mergedBlocks: mergeBlocks(blocks),
    prevContent: prevLines.join('\n'),
    matchContent: matchLines.join('\n'),
    nextContent: nextLines.join('\n'),
  }
}

const getBlocks = (lines: Array<string>) => {
  let started = -1
  let lang = ''
  const blocks: Array<Block> = []
  for (let i = 0; i < lines.length; i++) {
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
