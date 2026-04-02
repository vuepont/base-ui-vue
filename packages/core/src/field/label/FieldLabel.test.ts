import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import FieldControl from '../control/FieldControl.vue'
import FieldRoot from '../root/FieldRoot.vue'
import FieldLabel from './FieldLabel.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FieldRoot, FieldControl, FieldLabel },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldLabel />', () => {
  it('renders a label element by default', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldLabel data-testid="label">Name</FieldLabel>
            <FieldControl />
          </FieldRoot>
        `,
      }),
    )
    expect(screen.getByTestId('label').tagName).toBe('LABEL')
  })

  it('should set htmlFor referencing the control automatically', async () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl />
            <FieldLabel data-testid="label">Label</FieldLabel>
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    expect(screen.getByTestId('label')).toHaveAttribute(
      'for',
      screen.getByRole('textbox').id,
    )
  })

  it('when nativeLabel is false, clicking focuses the associated control', async () => {
    const user = userEvent.setup()

    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl data-testid="control" />
            <FieldLabel :native-label="false" as="div" data-testid="label">Label</FieldLabel>
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    const label = screen.getByTestId('label')
    const control = screen.getByTestId('control')

    expect(label).not.toHaveAttribute('for')

    await user.click(label)
    expect(control).toHaveFocus()
  })

  it('uses an explicit id when provided', async () => {
    const user = userEvent.setup()

    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl data-testid="control" />
            <FieldLabel id="my-id" data-testid="label">Label</FieldLabel>
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    const label = screen.getByTestId('label')
    const control = screen.getByTestId('control')

    expect(label).toHaveAttribute('id', 'my-id')
    expect(label).toHaveAttribute('for', control.id)

    await user.click(label)
    expect(control).toHaveFocus()
  })
})
