import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import ScrollAreaRoot from '../root/ScrollAreaRoot.vue'
import ScrollAreaViewport from './ScrollAreaViewport.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, unknown>
}) {
  return defineComponent({
    components: { ScrollAreaRoot, ScrollAreaViewport },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ScrollAreaViewport />', () => {
  it('renders a div element by default', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport data-testid="viewport" />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('viewport').tagName).toBe('DIV')
  })

  it('applies role="presentation"', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport data-testid="viewport" />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('viewport')).toHaveAttribute('role', 'presentation')
  })

  it('has overflow: scroll style', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport data-testid="viewport" />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('viewport').style.overflow).toBe('scroll')
  })

  it('applies the disable-scrollbar class', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport data-testid="viewport" />
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('viewport')).toHaveClass('base-ui-disable-scrollbar')
  })

  it('has tabindex=-1 by default when JSDOM reports no overflow', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport data-testid="viewport" />
          </ScrollAreaRoot>
        `,
      }),
    )
    // In JSDOM, there's no real overflow, so hiddenState is {x: true, y: true} → tabIndex = -1
    expect(screen.getByTestId('viewport')).toHaveAttribute('tabindex', '-1')
  })

  it('renders children inside the viewport', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport>
              <span data-testid="content">Hello</span>
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('content').textContent).toBe('Hello')
  })
})
