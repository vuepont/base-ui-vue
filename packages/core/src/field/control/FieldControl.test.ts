import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Slot } from '../../utils/slot'
import FieldError from '../error/FieldError.vue'
import FieldRoot from '../root/FieldRoot.vue'
import FieldControl from './FieldControl.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FieldRoot, FieldControl, FieldError },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldControl />', () => {
  it('renders an input element by default', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl data-testid="input" />
          </FieldRoot>
        `,
      }),
    )
    const input = screen.getByTestId('input')
    expect(input.tagName).toBe('INPUT')
  })

  it('sets default value', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl default-value="hello" data-testid="input" />
          </FieldRoot>
        `,
      }),
    )
    expect(screen.getByTestId('input')).toHaveValue('hello')
  })

  it('supports renderless mode and keeps the internal input ref working', async () => {
    const user = userEvent.setup()

    const WrappedInput = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => h('input', attrs)
      },
    })

    render(
      defineComponent({
        components: { FieldRoot, FieldControl, FieldError, WrappedInput },
        setup() {
          const fieldRef = ref<InstanceType<typeof FieldRoot> | null>(null)
          const validate = () => 'Custom error message'
          return { Slot, fieldRef, validate }
        },
        template: `
          <FieldRoot ref="fieldRef" :validate="validate">
            <FieldControl :as="Slot" v-slot="{ props, ref }">
              <WrappedInput data-testid="input" v-bind="props" :ref="ref" />
            </FieldControl>
            <FieldError data-testid="error" />
          </FieldRoot>
          <button data-testid="validate" type="button" @click="fieldRef?.validate()">Validate</button>
        `,
      }),
    )

    await user.click(screen.getByTestId('validate'))
    await nextTick()

    expect(screen.getByTestId('input').tagName).toBe('INPUT')
    expect(screen.getByTestId('error').textContent).toBe('Custom error message')
  })

  describe('prop: disabled', () => {
    it('applies disabled attribute', () => {
      render(
        createApp({
          template: `
            <FieldRoot disabled>
              <FieldControl data-testid="input" />
            </FieldRoot>
          `,
        }),
      )
      expect(screen.getByTestId('input')).toBeDisabled()
    })
  })

  describe('prop: required', () => {
    it('applies required attribute', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldControl required data-testid="input" />
            </FieldRoot>
          `,
        }),
      )
      expect(screen.getByTestId('input')).toBeRequired()
    })
  })

  describe('interaction: touch and focus', () => {
    it('sets data-focused when focused', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot data-testid="field">
              <FieldControl data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('input')
      await user.click(input)

      expect(screen.getByTestId('field')).toHaveAttribute('data-focused')
    })

    it('sets data-touched after blur', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot data-testid="field">
              <FieldControl data-testid="input" />
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.tab()

      expect(screen.getByTestId('field')).toHaveAttribute('data-touched')
    })
  })

  describe('validation', () => {
    it('does not show error before interaction', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldControl required data-testid="input" />
              <FieldError data-testid="error" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.queryByTestId('error')).toBeNull()
    })

    it('shows custom validation error', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          setup() {
            const validate = () => 'Custom error message'
            return { validate }
          },
          template: `
            <FieldRoot :validate="validate" validation-mode="onChange">
              <FieldControl data-testid="input" />
              <FieldError data-testid="error" />
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.keyboard('a')

      expect(screen.queryByTestId('error')).not.toBeNull()
      expect(screen.getByTestId('error').textContent).toBe('Custom error message')
    })

    it('shows valueMissing error when pressing Enter on an empty required input', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldControl required data-testid="input" />
              <FieldError data-testid="error" match="valueMissing">Required message</FieldError>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('input')
      await user.click(input)
      await user.keyboard('{Enter}')

      expect(screen.queryByTestId('error')).not.toBeNull()
      expect(screen.getByTestId('error').textContent).toBe('Required message')
    })
  })
})
