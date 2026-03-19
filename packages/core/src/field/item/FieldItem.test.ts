import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import FieldControl from '../control/FieldControl.vue'
import FieldLabel from '../label/FieldLabel.vue'
import FieldRoot from '../root/FieldRoot.vue'
import FieldItem from './FieldItem.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      FieldControl,
      FieldItem,
      FieldLabel,
      FieldRoot,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldItem />', () => {
  it('renders a div element by default', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldItem data-testid="item">
              <FieldControl />
            </FieldItem>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('item').tagName).toBe('DIV')
  })

  it('scopes labels to the wrapped control', async () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldItem>
              <FieldLabel>First name</FieldLabel>
              <FieldControl data-testid="first-control" />
            </FieldItem>
            <FieldItem>
              <FieldLabel>Last name</FieldLabel>
              <FieldControl data-testid="last-control" />
            </FieldItem>
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    const firstLabel = screen.getByText('First name')
    const firstControl = screen.getByTestId('first-control')

    const lastLabel = screen.getByText('Last name')
    const lastControl = screen.getByTestId('last-control')

    expect(firstControl).toHaveAttribute('aria-labelledby', firstLabel.getAttribute('id')!)
    expect(lastControl).toHaveAttribute('aria-labelledby', lastLabel.getAttribute('id')!)
  })

  it('inherits field disabled state attributes', () => {
    render(
      createApp({
        template: `
          <FieldRoot disabled>
            <FieldItem data-testid="item">
              <FieldControl />
            </FieldItem>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('item')).toHaveAttribute('data-disabled')
  })
})
