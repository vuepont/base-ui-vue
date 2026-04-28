import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import ScrollAreaRoot from '../root/ScrollAreaRoot.vue'
import ScrollAreaViewport from '../viewport/ScrollAreaViewport.vue'
import ScrollAreaContent from './ScrollAreaContent.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, unknown>
}) {
  return defineComponent({
    components: { ScrollAreaRoot, ScrollAreaViewport, ScrollAreaContent },
    setup: options.setup,
    template: options.template,
  })
}

describe('<ScrollAreaContent />', () => {
  it('renders a div element by default', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport>
              <ScrollAreaContent data-testid="content" />
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('content').tagName).toBe('DIV')
  })

  it('applies role="presentation"', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport>
              <ScrollAreaContent data-testid="content" />
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('content')).toHaveAttribute('role', 'presentation')
  })

  it('applies min-width: fit-content style', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport>
              <ScrollAreaContent data-testid="content" />
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('content').style.minWidth).toBe('fit-content')
  })

  it('renders children', () => {
    render(
      createApp({
        template: `
          <ScrollAreaRoot>
            <ScrollAreaViewport>
              <ScrollAreaContent>
                <span data-testid="inner">Text</span>
              </ScrollAreaContent>
            </ScrollAreaViewport>
          </ScrollAreaRoot>
        `,
      }),
    )
    expect(screen.getByTestId('inner').textContent).toBe('Text')
  })
})
