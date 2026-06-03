import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import FieldRoot from '../../field/root/FieldRoot.vue'
import OtpFieldRoot from '../root/OtpFieldRoot.vue'
import OtpFieldInput from './OtpFieldInput.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FieldRoot, OtpFieldRoot, OtpFieldInput },
    setup: options.setup,
    template: options.template,
  })
}

describe('<OtpFieldInput />', () => {
  it('renders an input element', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="3">
              <OtpFieldInput data-testid="slot" />
              <OtpFieldInput />
              <OtpFieldInput />
            </OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('slot').tagName).toBe('INPUT')
  })

  it('masks the value when the root sets mask', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="3" mask>
              <OtpFieldInput data-testid="slot" />
              <OtpFieldInput />
              <OtpFieldInput />
            </OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('slot')).toHaveAttribute('type', 'password')
  })

  it('preserves an explicitly provided input type', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="3">
              <OtpFieldInput data-testid="slot" type="tel" />
              <OtpFieldInput />
              <OtpFieldInput />
            </OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('slot')).toHaveAttribute('type', 'tel')
  })

  it('renders non-BMP characters as one slot when validation is disabled', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="2" default-value="😀a" validation-type="none">
              <OtpFieldInput data-testid="slot-0" />
              <OtpFieldInput data-testid="slot-1" />
            </OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('slot-0')).toHaveValue('😀')
    expect(screen.getByTestId('slot-1')).toHaveValue('a')
  })

  it('only allows the active slot to be tab-focusable', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="3" default-value="1">
              <OtpFieldInput data-testid="slot-0" />
              <OtpFieldInput data-testid="slot-1" />
              <OtpFieldInput data-testid="slot-2" />
            </OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    // The first empty slot (index 1) is the active one when not focused.
    expect(screen.getByTestId('slot-1')).toHaveAttribute('tabindex', '0')
    expect(screen.getByTestId('slot-0')).toHaveAttribute('tabindex', '-1')
  })

  it('fills multiple slots when pasting', async () => {
    const user = userEvent.setup()

    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="6">
              <OtpFieldInput v-for="i in 6" :key="i" />
            </OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    await user.click(inputs[0])
    await user.paste('123456')
    await flushPromises()

    expect(inputs[0]).toHaveValue('1')
    expect(inputs[5]).toHaveValue('6')
  })
})
