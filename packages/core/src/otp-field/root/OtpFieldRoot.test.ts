import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import FieldRoot from '../../field/root/FieldRoot.vue'
import OtpFieldInput from '../input/OtpFieldInput.vue'
import OtpFieldRoot from './OtpFieldRoot.vue'

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

const SIX_INPUTS = `
  <OtpFieldInput v-for="i in 6" :key="i" />
`

describe('<OtpFieldRoot />', () => {
  it('renders one input per slot', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="6">${SIX_INPUTS}</OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getAllByRole('textbox')).toHaveLength(6)
  })

  it('exposes a group role', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <OtpFieldRoot :length="6" data-testid="root">${SIX_INPUTS}</OtpFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByTestId('root')).toHaveAttribute('role', 'group')
  })

  describe('uncontrolled value', () => {
    it('updates the value and emits value-change when typing', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" @value-change="onValueChange">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      await user.click(inputs[0])
      await user.keyboard('1')
      await flushPromises()

      expect(onValueChange).toHaveBeenCalled()
      expect(onValueChange.mock.lastCall?.[0]).toBe('1')
      expect(inputs[0]).toHaveValue('1')
    })

    it('advances focus to the next slot after typing', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      await user.click(inputs[0])
      await user.keyboard('1')
      await flushPromises()

      expect(document.activeElement).toBe(inputs[1])
    })
  })

  describe('controlled value', () => {
    it('renders the controlled value across slots', () => {
      render(
        createApp({
          setup: () => ({ value: ref('123') }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" :value="value">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      expect(inputs[0]).toHaveValue('1')
      expect(inputs[1]).toHaveValue('2')
      expect(inputs[2]).toHaveValue('3')
      expect(inputs[3]).toHaveValue('')
    })
  })

  describe('validationType', () => {
    it('rejects characters outside the numeric set and emits value-invalid', async () => {
      const user = userEvent.setup()
      const onValueInvalid = vi.fn()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueInvalid, onValueChange }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" @value-invalid="onValueInvalid" @value-change="onValueChange">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      await user.click(inputs[0])
      await user.keyboard('a')
      await flushPromises()

      expect(onValueInvalid).toHaveBeenCalled()
      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('accepts letters when validationType is alpha', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" validation-type="alpha" @value-change="onValueChange">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      await user.click(inputs[0])
      await user.keyboard('a')
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe('a')
    })
  })

  describe('completion', () => {
    it('emits value-complete when all slots are filled', async () => {
      const user = userEvent.setup()
      const onValueComplete = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueComplete }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="3" @value-complete="onValueComplete">
                <OtpFieldInput v-for="i in 3" :key="i" />
              </OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      await user.click(inputs[0])
      await user.keyboard('1')
      await flushPromises()
      await user.keyboard('2')
      await flushPromises()
      await user.keyboard('3')
      await flushPromises()

      expect(onValueComplete).toHaveBeenCalled()
      expect(onValueComplete.mock.lastCall?.[0]).toBe('123')
    })
  })

  describe('prop: disabled', () => {
    it('disables every slot input', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" disabled>${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      for (const input of screen.getAllByRole('textbox')) {
        expect(input).toBeDisabled()
      }
    })

    it('inherits disabled from FieldRoot', () => {
      render(
        createApp({
          template: `
            <FieldRoot disabled>
              <OtpFieldRoot :length="6">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      for (const input of screen.getAllByRole('textbox')) {
        expect(input).toBeDisabled()
      }
    })
  })

  describe('keyboard navigation', () => {
    it('moves focus with arrow keys', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          setup: () => ({ value: ref('12') }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" :default-value="'123'">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      await user.click(inputs[2])
      await nextTick()
      await user.keyboard('{ArrowLeft}')
      expect(document.activeElement).toBe(inputs[1])

      await user.keyboard('{ArrowRight}')
      expect(document.activeElement).toBe(inputs[2])
    })

    it('clears the previous slot on Backspace from an empty slot', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <OtpFieldRoot :length="6" default-value="12" @value-change="onValueChange">${SIX_INPUTS}</OtpFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      // Slot index 2 is the first empty slot.
      await user.click(inputs[2])
      await nextTick()
      await user.keyboard('{Backspace}')
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe('1')
    })
  })
})
