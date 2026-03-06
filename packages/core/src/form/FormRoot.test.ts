import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import FieldControl from '../field/control/FieldControl.vue'
import FieldError from '../field/error/FieldError.vue'
import FieldRoot from '../field/root/FieldRoot.vue'
import FormRoot from './FormRoot.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { FormRoot, FieldRoot, FieldControl, FieldError },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FormRoot />', () => {
  it('renders a form element', () => {
    render(
      createApp({
        template: '<FormRoot data-testid="form" />',
      }),
    )
    expect(screen.getByTestId('form').tagName).toBe('FORM')
  })

  it('does not submit if there are errors', async () => {
    const user = userEvent.setup()

    render(
      createApp({
        template: `
          <FormRoot>
            <FieldRoot>
              <FieldControl required />
              <FieldError data-testid="error" />
            </FieldRoot>
            <button type="submit">Submit</button>
          </FormRoot>
        `,
      }),
    )

    const submit = screen.getByRole('button')
    await user.click(submit)

    expect(screen.getByTestId('error')).toBeTruthy()
  })

  describe('prop: noValidate', () => {
    it('should disable native validation if set to true (default)', () => {
      render(
        createApp({
          template: '<FormRoot data-testid="form" />',
        }),
      )
      expect(screen.getByTestId('form')).toHaveAttribute('novalidate')
    })

    it('should enable native validation if set to false', () => {
      render(
        createApp({
          template: '<FormRoot :no-validate="false" data-testid="form" />',
        }),
      )
      expect(screen.getByTestId('form')).not.toHaveAttribute('novalidate')
    })
  })

  it('unmounted fields should be removed from the form', async () => {
    const user = userEvent.setup()
    const submitSpy = vi.fn()

    const App = defineComponent({
      components: { FormRoot, FieldRoot, FieldControl },
      setup() {
        const showEmail = ref(true)
        return { showEmail, submitSpy }
      },
      template: `
        <FormRoot @form-submit="submitSpy">
          <FieldRoot name="name">
            <FieldControl default-value="Alice" />
          </FieldRoot>
          <button type="button" data-testid="toggle" @click="showEmail = false">Toggle</button>
          <FieldRoot v-if="showEmail" name="email">
            <FieldControl default-value="" required data-testid="email" />
          </FieldRoot>
          <button type="submit">Submit</button>
        </FormRoot>
      `,
    })

    render(App)

    await user.click(screen.getByText('Submit'))
    await nextTick()
    expect(submitSpy).not.toHaveBeenCalled()
    expect(screen.getByTestId('email')).toHaveAttribute('aria-invalid', 'true')

    await user.click(screen.getByTestId('toggle'))
    await nextTick()

    await user.click(screen.getByText('Submit'))
    await nextTick()
    expect(submitSpy).toHaveBeenCalledTimes(1)
  })

  describe('prop: errors', () => {
    it('should mark FieldControl as invalid and populate FieldError', async () => {
      render(
        createApp({
          setup() {
            return { errors: { foo: 'bar' } }
          },
          template: `
            <FormRoot :errors="errors">
              <FieldRoot name="foo">
                <FieldControl />
                <FieldError data-testid="error" />
              </FieldRoot>
            </FormRoot>
          `,
        }),
      )

      await nextTick()

      expect(screen.getByTestId('error').textContent).toBe('bar')
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    })

    it('should not mark FieldControl as invalid if no error is provided', () => {
      render(
        createApp({
          template: `
            <FormRoot>
              <FieldRoot name="foo">
                <FieldControl />
                <FieldError data-testid="error" />
              </FieldRoot>
            </FormRoot>
          `,
        }),
      )

      expect(screen.queryByTestId('error')).toBeNull()
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid')
    })

    it('removes errors upon change', async () => {
      const user = userEvent.setup()

      const App = createApp({
        setup() {
          const errors = ref<Record<string, string>>({})

          function onFormSubmit(formValues: Record<string, unknown>) {
            const name = (formValues.name as string) || ''
            const age = (formValues.age as string) || ''

            errors.value = {
              ...(name === '' ? { name: 'Name is required' } : {}),
              ...(age === '' ? { age: 'Age is required' } : {}),
            }
          }

          return { errors, onFormSubmit }
        },
        template: `
          <FormRoot :errors="errors" @form-submit="onFormSubmit">
            <FieldRoot name="name">
              <FieldControl data-testid="name" />
              <FieldError data-testid="name-error" />
            </FieldRoot>
            <FieldRoot name="age">
              <FieldControl data-testid="age" />
              <FieldError data-testid="age-error" />
            </FieldRoot>
            <button type="submit">Submit</button>
          </FormRoot>
        `,
      })

      render(App)

      await user.click(screen.getByText('Submit'))
      await nextTick()

      expect(screen.queryByTestId('name-error')).not.toBeNull()
      expect(screen.queryByTestId('age-error')).not.toBeNull()

      const nameInput = screen.getByTestId('name')
      await fireEvent.update(nameInput, 'John')
      await nextTick()

      expect(screen.queryByTestId('name-error')).toBeNull()

      const ageInput = screen.getByTestId('age')
      await fireEvent.update(ageInput, '42')
      await nextTick()

      expect(screen.queryByTestId('age-error')).toBeNull()
    })

    it('focuses the first invalid field only on submit', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FormRoot>
              <FieldRoot name="name">
                <FieldControl required data-testid="name" />
              </FieldRoot>
              <FieldRoot name="age">
                <FieldControl required data-testid="age" />
              </FieldRoot>
              <button type="submit">Submit</button>
            </FormRoot>
          `,
        }),
      )

      await user.click(screen.getByText('Submit'))
      await nextTick()

      expect(screen.getByTestId('name')).toHaveFocus()

      await fireEvent.update(screen.getByTestId('name'), 'John')
      await nextTick()
      expect(screen.getByTestId('age')).not.toHaveFocus()

      await user.click(screen.getByText('Submit'))
      await nextTick()

      expect(screen.getByTestId('age')).toHaveFocus()
    })

    it('runs field validation on first change after Form error is set', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn((value: unknown) => {
        if (value === 'abcd')
          return 'field error'
        return null
      })

      const App = defineComponent({
        components: { FormRoot, FieldRoot, FieldControl, FieldError },
        setup() {
          const errors = ref<Record<string, string>>({})

          function onFormSubmit(formValues: Record<string, unknown>) {
            const name = formValues.name as string

            if (name === 'abcde') {
              errors.value = { name: 'submit error' }
            }
            else {
              errors.value = {}
            }
          }

          return { errors, onFormSubmit, validateSpy }
        },
        template: `
          <FormRoot :errors="errors" @form-submit="onFormSubmit">
            <FieldRoot name="name" :validate="validateSpy">
              <FieldControl data-testid="name" />
              <FieldError data-testid="name-error" />
            </FieldRoot>
            <button type="submit">Submit</button>
          </FormRoot>
        `,
      })

      render(App)

      const input = screen.getByTestId('name')
      await user.click(input)
      await user.keyboard('abcde')
      await user.click(screen.getByText('Submit'))
      await nextTick()

      expect(screen.queryByTestId('name-error')).not.toBeNull()
      expect(screen.getByTestId('name-error').textContent).toBe('submit error')

      validateSpy.mockClear()

      await user.click(input)
      await user.keyboard('{Backspace}')
      await nextTick()

      expect(validateSpy).toHaveBeenCalled()
      expect(screen.queryByTestId('name-error')).not.toBeNull()
      expect(screen.getByTestId('name-error').textContent).toBe('field error')
    })

    it('runs field validation on change when invalid prop is true and validationMode is onChange', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn(() => 'field error')

      const App = createApp({
        setup() {
          return { validateSpy }
        },
        template: `
          <FormRoot :errors="{ name: 'server error' }">
            <FieldRoot name="name" invalid :validate="validateSpy" validation-mode="onChange">
              <FieldControl data-testid="name" />
              <FieldError data-testid="name-error" />
            </FieldRoot>
          </FormRoot>
        `,
      })

      render(App)
      await nextTick()

      expect(screen.getByTestId('name-error').textContent).toBe('server error')

      const input = screen.getByTestId('name')
      await user.click(input)
      await user.keyboard('a')
      await nextTick()

      expect(validateSpy).toHaveBeenCalled()
      expect(screen.getByTestId('name-error').textContent).toBe('field error')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('does not run field validation on change for onBlur mode when invalid prop is true', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn(() => 'field error')

      const App = createApp({
        setup() {
          return { validateSpy }
        },
        template: `
          <FormRoot :errors="{ name: 'server error' }">
            <FieldRoot name="name" invalid :validate="validateSpy" validation-mode="onBlur">
              <FieldControl data-testid="name" />
              <FieldError data-testid="name-error" />
            </FieldRoot>
          </FormRoot>
        `,
      })

      render(App)
      await nextTick()

      expect(screen.getByTestId('name-error').textContent).toBe('server error')

      const input = screen.getByTestId('name')
      await user.click(input)
      await user.keyboard('a')
      await nextTick()

      expect(validateSpy).not.toHaveBeenCalled()
      expect(screen.queryByTestId('name-error')).toBeNull()

      await user.tab()
      await nextTick()

      expect(validateSpy).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('name-error').textContent).toBe('field error')
    })
  })

  it('does not submit when invalid prop remains true even if validate returns null', async () => {
    const user = userEvent.setup()
    const submitSpy = vi.fn()
    const validateSpy = vi.fn(() => null)

    render(
      createApp({
        setup() {
          return { submitSpy, validateSpy }
        },
        template: `
          <FormRoot @submit="submitSpy">
            <FieldRoot name="name" invalid :validate="validateSpy" validation-mode="onChange">
              <FieldControl data-testid="name" />
              <FieldError data-testid="name-error" />
            </FieldRoot>
            <button type="submit">submit</button>
          </FormRoot>
        `,
      }),
    )

    const input = screen.getByTestId('name')
    await user.click(input)
    await user.keyboard('o')
    await nextTick()

    expect(validateSpy).toHaveBeenCalled()

    await user.click(screen.getByText('submit'))
    await nextTick()

    expect(submitSpy).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  describe('emit: formSubmit', () => {
    it('runs when the form is submitted with valid data', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn()

      render(
        createApp({
          setup() {
            return { submitSpy }
          },
          template: `
            <FormRoot @form-submit="submitSpy">
              <FieldRoot name="username">
                <FieldControl default-value="alice132" />
              </FieldRoot>
              <button type="submit">submit</button>
            </FormRoot>
          `,
        }),
      )

      await user.click(screen.getByText('submit'))
      await nextTick()

      expect(submitSpy).toHaveBeenCalledTimes(1)
      expect(submitSpy.mock.calls[0][0]).toEqual({
        username: 'alice132',
      })
    })

    it('does not run when the form is invalid', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn()

      render(
        createApp({
          setup() {
            return { submitSpy }
          },
          template: `
            <FormRoot @form-submit="submitSpy">
              <FieldRoot name="username">
                <FieldControl default-value="" required />
                <FieldError data-testid="error" />
              </FieldRoot>
              <button type="submit">submit</button>
            </FormRoot>
          `,
        }),
      )

      expect(screen.queryByTestId('error')).toBeNull()
      await user.click(screen.getByText('submit'))
      await nextTick()

      expect(submitSpy).not.toHaveBeenCalled()
      expect(screen.queryByTestId('error')).not.toBeNull()
    })
  })
})
