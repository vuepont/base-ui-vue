import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, shallowRef } from 'vue'
import ScrollAreaRoot from '../root/ScrollAreaRoot.vue'
import ScrollAreaThumb from '../thumb/ScrollAreaThumb.vue'
import ScrollAreaViewport from '../viewport/ScrollAreaViewport.vue'
import ScrollAreaScrollbar from './ScrollAreaScrollbar.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { ScrollAreaRoot, ScrollAreaThumb, ScrollAreaViewport, ScrollAreaScrollbar },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ScrollAreaScrollbar />', () => {
  it('renders with data-orientation="vertical" by default', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" keep-mounted />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('scrollbar')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('renders with data-orientation="horizontal"', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" orientation="horizontal" keep-mounted />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('scrollbar')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('applies position: absolute style', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" keep-mounted />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('scrollbar').style.position).toBe('absolute')
  })

  it('applies touch-action: none', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" keep-mounted />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('scrollbar').style.touchAction).toBe('none')
  })

  it('does not render when no overflow and keepMounted is false', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.queryByTestId('scrollbar')).toBeNull()
  })

  it('renders when keepMounted is true even without overflow', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" keep-mounted />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('scrollbar')).toBeTruthy()
  })

  it('updates thumb orientation when orientation changes', async () => {
    render(
      createApp({
        setup() {
          const orientation = shallowRef<'horizontal' | 'vertical'>('vertical')

          return { orientation }
        },
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar data-testid="scrollbar" :orientation="orientation" keep-mounted>
              <ScrollAreaThumb data-testid="thumb" />
            </ScrollAreaScrollbar>
            <button type="button" @click="orientation = 'horizontal'">Set horizontal</button>
          </ScrollAreaRoot>
        `,
      }),
    )

    expect(screen.getByTestId('scrollbar')).toHaveAttribute('data-orientation', 'vertical')
    expect(screen.getByTestId('thumb')).toHaveAttribute('data-orientation', 'vertical')

    await fireEvent.click(screen.getByRole('button', { name: 'Set horizontal' }))

    expect(screen.getByTestId('scrollbar')).toHaveAttribute('data-orientation', 'horizontal')
    expect(screen.getByTestId('thumb')).toHaveAttribute('data-orientation', 'horizontal')
  })
})
