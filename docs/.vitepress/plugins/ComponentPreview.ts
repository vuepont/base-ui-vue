import type { MarkdownEnv, MarkdownRenderer } from 'vitepress'
import { readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/* eslint-disable regexp/no-super-linear-backtracking */
const rawPathRegexp
  = /^(.+?(?:\.([a-z0-9]+))?)(#[\w-]+)?(?: ?\{(\d+(?:[,-]\d+)*)? ?(\S+)?\})? ?(?:\[(.+)\])?$/
/* eslint-enable regexp/no-super-linear-backtracking */

function rawPathToToken(rawPath: string) {
  const [
    filepath = '',
    extension = '',,
    lines = '',
    lang = '',
    rawTitle = '',
  ] = (rawPathRegexp.exec(rawPath) || []).slice(1)

  const title = rawTitle || filepath.split('/').pop() || ''

  return { filepath, extension, lines, lang, title }
}

export default function (md: MarkdownRenderer) {
  md.core.ruler.after('inline', 'component-preview', (state) => {
    const insertComponentImport = (importString: string) => {
      const index = state.tokens.findIndex(i => i.type === 'html_block' && i.content.match(/<script setup>/g))
      if (index === -1) {
        const importComponent = new state.Token('html_block', '', 0)
        importComponent.content = `<script setup>\n${importString}\n</script>\n`
        state.tokens.splice(0, 0, importComponent)
      }
      else {
        const content = state.tokens[index].content
        state.tokens[index].content = content.replace('</script>', `${importString}\n</script>`)
      }
    }

    // eslint-disable-next-line regexp/no-super-linear-backtracking
    const regex = /<ComponentPreview\s+([^>]+)\/>/g

    state.src = state.src.replace(regex, (_, bindingValue) => {
      const propPattern = /(\w+)="([^"]*)"/g
      const props: { [key: string]: string } = {}
      const matches = bindingValue.matchAll(propPattern)

      for (const match of matches) {
        const [, propName, propValue] = match
        props[propName] = propValue
      }

      const { realPath, path: _path } = state.env as MarkdownEnv
      const pathName = `../../../components/demo/${props.name}`
      const demoPath = resolve(dirname(realPath ?? _path), pathName)

      const childFiles = readdirSync(demoPath, { withFileTypes: false, recursive: true })
        .map(file => typeof file === 'string' ? file.split(/[/\\]/).join('/') : file)

      const groupedFiles = childFiles.reduce((prev, curr) => {
        if (typeof curr !== 'string')
          return prev
        if (!curr.includes('/')) {
          prev[curr] = []
        }
        else {
          const folder = curr.split('/')[0]
          if (!prev[folder])
            prev[folder] = []
          prev[folder].push(curr)
        }
        return prev
      }, {} as { [key: string]: string[] })

      if (groupedFiles.tailwind) {
        insertComponentImport(`import ${props.name}Tailwind from '${pathName}/tailwind/index.vue'`)
      }

      if (groupedFiles.css) {
        insertComponentImport(`import ${props.name}Css from '${pathName}/css/index.vue'`)
      }

      const index = state.tokens.findIndex(i => i.content.match(regex))

      const demoSlots = []
      if (groupedFiles.tailwind) {
        demoSlots.push(`<template #demo-tailwind><${props.name}Tailwind /></template>`)
      }
      if (groupedFiles.css) {
        demoSlots.push(`<template #demo-css><${props.name}Css /></template>`)
      }

      state.tokens[index].content = `<ComponentPreview name="${props.name}" files="${encodeURIComponent(JSON.stringify(groupedFiles))}" >\n${demoSlots.join('\n')}`
      const tokenArray: InstanceType<typeof state.Token>[] = []

      Object.entries(groupedFiles).forEach(([key, value]) => {
        const templateStart = new state.Token('html_inline', '', 0)
        templateStart.content = `<template #${key}>`
        tokenArray.push(templateStart)

        value.forEach((file) => {
          const { filepath, extension, lines, lang, title } = rawPathToToken(`${pathName}/${file}`)
          const resolvedPath = resolve(dirname(realPath ?? _path), filepath)

          const token = new state.Token('fence', 'code', 0)
          token.info = `${lang || extension}${lines ? `{${lines}}` : ''}${
            title ? `[${title}]` : ''
          }`

          token.content = `<<< ${filepath}`
          // @ts-expect-error token.src is for snippets plugin to handle importing snippet
          token.src = [resolvedPath]
          tokenArray.push(token)
        })

        const templateEnd = new state.Token('html_inline', '', 0)
        templateEnd.content = '</template>'
        tokenArray.push(templateEnd)
      })

      const endTag = new state.Token('html_inline', '', 0)
      endTag.content = '</ComponentPreview>'
      tokenArray.push(endTag)

      state.tokens.splice(index + 1, 0, ...tokenArray)

      return ''
    })
  })
}
