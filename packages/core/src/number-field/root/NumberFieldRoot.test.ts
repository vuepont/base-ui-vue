import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import FieldRoot from '../../field/root/FieldRoot.vue'
import NumberFieldDecrement from '../decrement/NumberFieldDecrement.vue'
import NumberFieldGroup from '../group/NumberFieldGroup.vue'
import NumberFieldIncrement from '../increment/NumberFieldIncrement.vue'
import NumberFieldInput from '../input/NumberFieldInput.vue'
import NumberFieldRoot from './NumberFieldRoot.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      FieldRoot,
      NumberFieldRoot,
      NumberFieldGroup,
      NumberFieldInput,
      NumberFieldIncrement,
      NumberFieldDecrement,
    },
    setup: options.setup,
    template: options.template,
  })
}

const GROUP = `
  <NumberFieldGroup>
    <NumberFieldDecrement>-</NumberFieldDecrement>
    <NumberFieldInput />
    <NumberFieldIncrement>+</NumberFieldIncrement>
  </NumberFieldGroup>
`

describe('<NumberFieldRoot />', () => {
  it('renders an input with the formatted default value', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <NumberFieldRoot :default-value="5">${GROUP}</NumberFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByRole('textbox')).toHaveValue('5')
  })

  it('exposes a group role', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <NumberFieldRoot :default-value="5">${GROUP}</NumberFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('renders a controlled value', () => {
    render(
      createApp({
        setup: () => ({ value: ref(10) }),
        template: `
          <FieldRoot>
            <NumberFieldRoot :value="value">${GROUP}</NumberFieldRoot>
          </FieldRoot>
        `,
      }),
    )

    expect(screen.getByRole('textbox')).toHaveValue('10')
  })

  describe('increment / decrement', () => {
    it('increments the value when the increment button is pressed', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      await user.click(screen.getByRole('button', { name: 'Increase' }))
      await flushPromises()

      expect(onValueChange).toHaveBeenCalled()
      expect(onValueChange.mock.lastCall?.[0]).toBe(6)
      expect(screen.getByRole('textbox')).toHaveValue('6')
    })

    it('decrements the value when the decrement button is pressed', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      await user.click(screen.getByRole('button', { name: 'Decrease' }))
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe(4)
      expect(screen.getByRole('textbox')).toHaveValue('4')
    })

    it('respects the step prop', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="0" :step="5" @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      await user.click(screen.getByRole('button', { name: 'Increase' }))
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe(5)
    })

    it('disables the increment button at the maximum', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" :max="5">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
    })

    it('disables the decrement button at the minimum', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="0" :min="0">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
    })
  })

  describe('text entry', () => {
    it('emits value-change with the parsed value when typing', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('42')
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe(42)
    })

    it('formats the value on blur', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot>
              <NumberFieldRoot>${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('1000')
      await user.tab()
      await flushPromises()

      expect(input).toHaveValue('1,000')
    })

    it('clears the value when emptied', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.clear(input)
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe(null)
    })
  })

  describe('keyboard', () => {
    it('increments with ArrowUp', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('{ArrowUp}')
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe(6)
    })

    it('decrements with ArrowDown', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.click(input)
      await user.keyboard('{ArrowDown}')
      await flushPromises()

      expect(onValueChange.mock.lastCall?.[0]).toBe(4)
    })
  })

  describe('prop: disabled', () => {
    it('disables the input and buttons', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" disabled>${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByRole('textbox')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Increase' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Decrease' })).toBeDisabled()
    })

    it('inherits disabled from FieldRoot', () => {
      render(
        createApp({
          template: `
            <FieldRoot disabled>
              <NumberFieldRoot :default-value="5">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('prop: readOnly', () => {
    it('marks the input as read-only and does not change on arrow keys', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()

      render(
        createApp({
          setup: () => ({ onValueChange }),
          template: `
            <FieldRoot>
              <NumberFieldRoot :default-value="5" read-only @value-change="onValueChange">${GROUP}</NumberFieldRoot>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox') as HTMLInputElement
      expect(input).toHaveAttribute('readonly')

      await user.click(input)
      await user.keyboard('{ArrowUp}')
      await flushPromises()

      expect(onValueChange).not.toHaveBeenCalled()
    })
  })
})
