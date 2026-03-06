import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import FieldControl from '../control/FieldControl.vue'
import FieldRoot from '../root/FieldRoot.vue'
import FieldDescription from './FieldDescription.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FieldRoot, FieldControl, FieldDescription },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldDescription />', () => {
  it('renders a p element by default', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl />
            <FieldDescription data-testid="desc">Message</FieldDescription>
          </FieldRoot>
        `,
      }),
    )
    expect(screen.getByTestId('desc').tagName).toBe('P')
  })

  it('should set aria-describedby on the control automatically', async () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl />
            <FieldDescription>Message</FieldDescription>
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining(screen.getByText('Message').id),
    )
  })
})
