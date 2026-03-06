import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import FormRoot from '../../form/FormRoot.vue'
import FieldControl from '../control/FieldControl.vue'
import FieldRoot from '../root/FieldRoot.vue'
import FieldValidity from './FieldValidity.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FormRoot, FieldRoot, FieldControl, FieldValidity },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldValidity />', () => {
  describe('validationMode=onSubmit', () => {
    it('should pass validity data', async () => {
      const handleValidity = vi.fn()

      render(
        createApp({
          setup() {
            return { handleValidity }
          },
          template: `
            <FormRoot>
              <FieldRoot>
                <FieldControl required />
                <FieldValidity v-slot="slotProps">
                  <div data-testid="validity" @click="handleValidity(slotProps)" />
                </FieldValidity>
              </FieldRoot>
              <button type="submit">submit</button>
            </FormRoot>
          `,
        }),
      )

      const validityEl = screen.getByTestId('validity')

      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].validity.valid).toBe(null)

      await fireEvent.click(screen.getByText('submit'))
      await nextTick()

      handleValidity.mockClear()
      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].validity.valid).toBe(false)
      expect(handleValidity.mock.calls[0][0].validity.valueMissing).toBe(true)

      const input = screen.getByRole('textbox')
      await fireEvent.update(input, 'test')
      await nextTick()

      handleValidity.mockClear()
      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].value).toBe('test')
      expect(handleValidity.mock.calls[0][0].validity.valid).toBe(true)
      expect(handleValidity.mock.calls[0][0].validity.valueMissing).toBe(false)
    })
  })

  describe('validationMode=onBlur', () => {
    it('should pass validity data', async () => {
      const handleValidity = vi.fn()

      render(
        createApp({
          setup() {
            return { handleValidity }
          },
          template: `
            <FieldRoot validation-mode="onBlur">
              <FieldControl required />
              <FieldValidity v-slot="slotProps">
                <div data-testid="validity" @click="handleValidity(slotProps)" />
              </FieldValidity>
            </FieldRoot>
          `,
        }),
      )

      const validityEl = screen.getByTestId('validity')

      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].validity.valid).toBe(null)

      const input = screen.getByRole('textbox')
      await fireEvent.focus(input)
      await fireEvent.update(input, 'test')
      await fireEvent.blur(input)
      await nextTick()

      handleValidity.mockClear()
      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].value).toBe('test')
      expect(handleValidity.mock.calls[0][0].validity.valid).toBe(true)
      expect(handleValidity.mock.calls[0][0].validity.valueMissing).toBe(false)
    })

    it('should correctly pass errors when validate function returns a string', async () => {
      const handleValidity = vi.fn()

      render(
        createApp({
          setup() {
            return { handleValidity, validate: () => 'error' }
          },
          template: `
            <FieldRoot validation-mode="onBlur" :validate="validate">
              <FieldControl />
              <FieldValidity v-slot="slotProps">
                <div data-testid="validity" @click="handleValidity(slotProps)" />
              </FieldValidity>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox')
      await fireEvent.focus(input)
      await fireEvent.blur(input)
      await nextTick()

      const validityEl = screen.getByTestId('validity')
      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].error).toBe('error')
      expect(handleValidity.mock.calls[0][0].errors).toEqual(['error'])
    })

    it('should correctly pass errors when validate function returns an array of strings', async () => {
      const handleValidity = vi.fn()

      render(
        createApp({
          setup() {
            return { handleValidity, validate: () => ['1', '2'] }
          },
          template: `
            <FieldRoot validation-mode="onBlur" :validate="validate">
              <FieldControl />
              <FieldValidity v-slot="slotProps">
                <div data-testid="validity" @click="handleValidity(slotProps)" />
              </FieldValidity>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByRole('textbox')
      await fireEvent.focus(input)
      await fireEvent.blur(input)
      await nextTick()

      const validityEl = screen.getByTestId('validity')
      await fireEvent.click(validityEl)
      expect(handleValidity.mock.calls[0][0].error).toBe('1')
      expect(handleValidity.mock.calls[0][0].errors).toEqual(['1', '2'])
    })
  })
})
