import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import ScrollAreaRoot from '../root/ScrollAreaRoot.vue'
import ScrollAreaScrollbar from '../scrollbar/ScrollAreaScrollbar.vue'
import ScrollAreaViewport from '../viewport/ScrollAreaViewport.vue'
import ScrollAreaThumb from './ScrollAreaThumb.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ScrollAreaThumb />', () => {
  it('renders a div element inside a vertical scrollbar', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar keep-mounted>
              <ScrollAreaThumb data-testid="thumb" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('thumb').tagName).toBe('DIV')
  })

  it('has data-orientation="vertical" by default', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar keep-mounted>
              <ScrollAreaThumb data-testid="thumb" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('thumb')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('has data-orientation="horizontal" for horizontal scrollbar', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport />
            <ScrollAreaScrollbar orientation="horizontal" keep-mounted>
              <ScrollAreaThumb data-testid="thumb" />
            </ScrollAreaScrollbar>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('thumb')).toHaveAttribute('data-orientation', 'horizontal')
  })
})
