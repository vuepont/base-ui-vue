import { fireEvent, render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { DirectionProvider, useDirection } from './index'

const DirectionValue = defineComponent({
  name: 'DirectionValue',
  setup() {
    const direction = useDirection()

    return { direction }
  },
  template: '<div data-testid="direction">{{ direction }}</div>',
})

describe('directionProvider', () => {
  it('returns ltr by default when no provider is present', () => {
    render(DirectionValue)

    expect(screen.getByTestId('direction')).toHaveTextContent('ltr')
  })

  it('provides the current direction to descendants', () => {
    const App = defineComponent({
      components: { DirectionProvider, DirectionValue },
      template: `
        <DirectionProvider direction="rtl">
          <DirectionValue />
        </DirectionProvider>
      `,
    })

    render(App)

    expect(screen.getByTestId('direction')).toHaveTextContent('rtl')
  })

  it('uses the nearest provider when nested', () => {
    const App = defineComponent({
      components: { DirectionProvider, DirectionValue },
      template: `
        <DirectionProvider direction="rtl">
          <DirectionProvider direction="ltr">
            <DirectionValue />
          </DirectionProvider>
        </DirectionProvider>
      `,
    })

    render(App)

    expect(screen.getByTestId('direction')).toHaveTextContent('ltr')
  })

  it('updates when the provider direction changes', async () => {
    const App = defineComponent({
      components: { DirectionProvider, DirectionValue },
      setup() {
        const direction = ref<'ltr' | 'rtl'>('ltr')

        return { direction }
      },
      template: `
        <button type="button" @click="direction = direction === 'ltr' ? 'rtl' : 'ltr'">
          Toggle
        </button>
        <DirectionProvider :direction="direction">
          <DirectionValue />
        </DirectionProvider>
      `,
    })

    render(App)

    expect(screen.getByTestId('direction')).toHaveTextContent('ltr')

    await fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
    await flushPromises()

    expect(screen.getByTestId('direction')).toHaveTextContent('rtl')
  })
})
