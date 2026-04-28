import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, shallowRef } from 'vue'
import { SCROLL_TIMEOUT } from '../constants'
import ScrollAreaViewport from '../viewport/ScrollAreaViewport.vue'
import ScrollAreaRoot from './ScrollAreaRoot.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { ScrollAreaRoot, ScrollAreaViewport },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ScrollAreaRoot />', () => {
  it('renders a div element by default', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot data-testid="root">
            <ScrollAreaViewport />
          </ScrollAreaRoot>
        `,
      }),
    )
    const root = screen.getByTestId('root')
    expect(root.tagName).toBe('DIV')
  })

  it('applies role="presentation"', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot data-testid="root">
            <ScrollAreaViewport />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('root')).toHaveAttribute('role', 'presentation')
  })

  it('applies position: relative style', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot data-testid="root">
            <ScrollAreaViewport />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('root').style.position).toBe('relative')
  })

  it('renders with custom class', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot data-testid="root" class="my-scroll">
            <ScrollAreaViewport />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('root')).toHaveClass('my-scroll')
  })

  it('sets CSS variables for corner size', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot data-testid="root">
            <ScrollAreaViewport />
          </ScrollAreaRoot>
        `,
      }),
    )
    const root = screen.getByTestId('root')
    expect(root.style.getPropertyValue('--scroll-area-corner-height')).toBe('0px')
    expect(root.style.getPropertyValue('--scroll-area-corner-width')).toBe('0px')
  })

  describe('data-scrolling attribute', () => {
    it('does not have data-scrolling by default', () => {
      render(
        createApp({
          template: `
            <ScrollAreaRoot data-testid="root">
              <ScrollAreaViewport data-testid="viewport" />
            </ScrollAreaRoot>
          `,
        }),
      )
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-scrolling')
    })

    it('adds data-scrolling on scroll and removes after timeout', async () => {
      vi.useFakeTimers()

      render(
        createApp({
          template: `
            <ScrollAreaRoot data-testid="root">
              <ScrollAreaViewport data-testid="viewport" />
            </ScrollAreaRoot>
          `,
        }),
      )

      const viewport = screen.getByTestId('viewport')

      await fireEvent.pointerEnter(viewport)
      await fireEvent.scroll(viewport)

      vi.advanceTimersByTime(SCROLL_TIMEOUT + 100)

      vi.useRealTimers()
    })
  })

  it('updates overflow edge attributes when overflowEdgeThreshold changes', async () => {
    render(
      createApp({
        setup() {
          const threshold = shallowRef(20)

          return { threshold }
        },
        template: `
          <ScrollAreaRoot data-testid="root" :overflow-edge-threshold="threshold">
            <ScrollAreaViewport data-testid="viewport" />
            <button type="button" @click="threshold = 30">Increase threshold</button>
          </ScrollAreaRoot>
        `,
      }),
    )

    const root = screen.getByTestId('root')
    const viewport = screen.getByTestId('viewport')
    defineViewportMetrics(viewport, {
      clientHeight: 100,
      clientWidth: 100,
      scrollHeight: 300,
      scrollWidth: 100,
    })

    viewport.scrollTop = 25
    await fireEvent.scroll(viewport)
    expect(root).toHaveAttribute('data-overflow-y-start')

    await fireEvent.click(screen.getByRole('button', { name: 'Increase threshold' }))
    expect(root).not.toHaveAttribute('data-overflow-y-start')
  })
})

function defineViewportMetrics(
  element: HTMLElement,
  metrics: {
    clientHeight: number
    clientWidth: number
    scrollHeight: number
    scrollWidth: number
  },
) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
    })
  }
}
