import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { useCSPContext } from './CSPContext'
import CSPProvider from './CSPProvider.vue'

const TestStyleConsumer = defineComponent({
  setup() {
    const csp = useCSPContext()
    return () =>
      csp.disableStyleElements.value
        ? null
        : h('style', { 'data-testid': 'inline-style' }, '.test-inline-style { color: red; }')
  },
})

const TestScriptConsumer = defineComponent({
  setup() {
    const csp = useCSPContext()
    return () =>
      h('script', { 'data-testid': 'inline-script', 'nonce': csp.nonce.value }, 'window.__test = true;')
  },
})

describe('<CSPProvider />', () => {
  it('does not render inline style tags when disableStyleElements is true', () => {
    render(defineComponent({
      components: { CSPProvider, TestStyleConsumer },
      template: `
        <CSPProvider :disable-style-elements="true">
          <TestStyleConsumer />
        </CSPProvider>
      `,
    }))

    expect(document.querySelector('[data-testid="inline-style"]')).toBeNull()
  })

  // TODO: Add the matching Select integration case once Select is available.
  it('applies nonce to inline script tags', () => {
    render(defineComponent({
      components: { CSPProvider, TestScriptConsumer },
      template: `
        <CSPProvider nonce="test-nonce">
          <TestScriptConsumer />
        </CSPProvider>
      `,
    }))

    expect(document.querySelector('[data-testid="inline-script"]')).toHaveAttribute('nonce', 'test-nonce')
  })

  it('renders inline style tags by default', () => {
    render(TestStyleConsumer)

    expect(document.querySelector('[data-testid="inline-style"]')).not.toBeNull()
  })

  it('updates injected values when props change', async () => {
    render(defineComponent({
      components: { CSPProvider, TestStyleConsumer, TestScriptConsumer },
      setup() {
        const nonce = ref('nonce-a')
        const disableStyleElements = ref(false)

        return {
          nonce,
          disableStyleElements,
          update() {
            nonce.value = 'nonce-b'
            disableStyleElements.value = true
          },
        }
      },
      template: `
        <div>
          <CSPProvider :nonce="nonce" :disable-style-elements="disableStyleElements">
            <TestStyleConsumer />
            <TestScriptConsumer />
          </CSPProvider>
          <button type="button" @click="update">update</button>
        </div>
      `,
    }))

    expect(document.querySelector('[data-testid="inline-script"]')).toHaveAttribute('nonce', 'nonce-a')
    expect(document.querySelector('[data-testid="inline-style"]')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'update' }))
    await nextTick()

    expect(document.querySelector('[data-testid="inline-script"]')).toHaveAttribute('nonce', 'nonce-b')
    expect(document.querySelector('[data-testid="inline-style"]')).toBeNull()
  })
})
