import { describe, expect, it } from 'vitest'
import { activeElement, contains, getTarget } from './shadowDom'

describe('floating-ui-vue shadowDom utils', () => {
  it('activeElement returns the deepest active element', () => {
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const button = document.createElement('button')

    shadowRoot.append(button)
    document.body.append(host)
    button.focus()

    expect(activeElement(document)).toBe(button)

    document.body.removeChild(host)
  })

  it('contains traverses through shadow roots', () => {
    const parent = document.createElement('div')
    const host = document.createElement('div')
    const shadowRoot = host.attachShadow({ mode: 'open' })
    const child = document.createElement('button')

    shadowRoot.append(child)
    parent.append(host)
    document.body.append(parent)

    expect(contains(parent, child)).toBe(true)

    document.body.removeChild(parent)
  })

  it('getTarget uses composedPath when available', () => {
    const first = document.createElement('button')
    const fallback = document.createElement('div')
    const event = new Event('click')

    Object.defineProperty(event, 'target', {
      value: fallback,
    })
    Object.defineProperty(event, 'composedPath', {
      value: () => [first, fallback],
    })

    expect(getTarget(event)).toBe(first)
  })

  it('getTarget falls back to event.target when composedPath is not available', () => {
    const target = document.createElement('button')
    const event = new Event('click')

    Object.defineProperty(event, 'target', {
      value: target,
    })
    Object.defineProperty(event, 'composedPath', {
      value: undefined,
    })

    expect(getTarget(event)).toBe(target)
  })
})
