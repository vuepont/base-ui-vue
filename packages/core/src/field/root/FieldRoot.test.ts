import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import Form from '../../form/Form.vue'
import FieldControl from '../control/FieldControl.vue'
import FieldDescription from '../description/FieldDescription.vue'
import FieldError from '../error/FieldError.vue'
import FieldLabel from '../label/FieldLabel.vue'
import FieldRoot from './FieldRoot.vue'

function createApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: { Form, FieldRoot, FieldControl, FieldLabel, FieldError, FieldDescription },
    setup: options.setup,
    template: options.template,
  })
}

describe('<FieldRoot />', () => {
  it('renders a div element by default', () => {
    render(
      createApp({
        template: `
          <FieldRoot data-testid="field">
            <FieldControl />
          </FieldRoot>
        `,
      }),
    )
    const field = screen.getByTestId('field')
    expect(field.tagName).toBe('DIV')
  })

  it('renders children', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldLabel>Name</FieldLabel>
            <FieldControl />
          </FieldRoot>
        `,
      }),
    )
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('associates label with control via aria-labelledby', async () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldLabel>Name</FieldLabel>
            <FieldControl />
          </FieldRoot>
        `,
      }),
    )

    await nextTick()

    const label = screen.getByText('Name')
    const input = screen.getByRole('textbox')

    const labelId = label.getAttribute('id')
    expect(labelId).toBeTruthy()
    expect(input).toHaveAttribute('aria-labelledby', labelId)
  })

  it('renders description', () => {
    render(
      createApp({
        template: `
          <FieldRoot>
            <FieldControl />
            <FieldDescription>Enter your name</FieldDescription>
          </FieldRoot>
        `,
      }),
    )
    expect(screen.getByText('Enter your name')).toBeTruthy()
  })

  describe('prop: disabled', () => {
    it('sets data-disabled when disabled', () => {
      render(
        createApp({
          template: `
            <FieldRoot disabled data-testid="field">
              <FieldControl />
            </FieldRoot>
          `,
        }),
      )
      expect(screen.getByTestId('field')).toHaveAttribute('data-disabled')
    })

    it('should add data-disabled to all components', async () => {
      render(
        createApp({
          template: `
            <FieldRoot disabled data-testid="field">
              <FieldLabel data-testid="label">Label</FieldLabel>
              <FieldControl data-testid="control" />
              <FieldDescription data-testid="description">Desc</FieldDescription>
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('field')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('label')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('control')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('description')).toHaveAttribute('data-disabled')
    })
  })

  describe('prop: name', () => {
    it('passes name to the control', () => {
      render(
        createApp({
          template: `
            <FieldRoot name="email">
              <FieldControl />
            </FieldRoot>
          `,
        }),
      )
      expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
    })
  })

  describe('prop: validate', () => {
    it('when not in Form the function does not run by default', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn(() => 'error')

      render(
        createApp({
          setup() {
            return { validateSpy }
          },
          template: `
            <FieldRoot :validate="validateSpy">
              <FieldControl data-testid="control" />
              <FieldError data-testid="error" />
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('control')
      await user.click(input)
      await user.keyboard('test')
      await user.tab()
      await nextTick()

      expect(validateSpy).not.toHaveBeenCalled()
      expect(screen.queryByTestId('error')).toBeNull()
    })

    it('should apply aria-invalid prop to control once validation finishes', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          setup() {
            return { validate: () => 'error' }
          },
          template: `
            <Form>
              <FieldRoot :validate="validate">
                <FieldControl data-testid="control" />
              </FieldRoot>
              <button type="submit">submit</button>
            </Form>
          `,
        }),
      )

      expect(screen.getByTestId('control')).not.toHaveAttribute('aria-invalid')

      await user.click(screen.getByText('submit'))
      await nextTick()

      expect(screen.getByTestId('control')).toHaveAttribute('aria-invalid', 'true')
    })

    it('receives all form values as the 2nd argument', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn(() => 'error')

      render(
        createApp({
          setup() {
            return { validateSpy }
          },
          template: `
            <Form>
              <FieldRoot name="first" :validate="validateSpy">
                <FieldControl default-value="John" />
              </FieldRoot>
              <FieldRoot name="last">
                <FieldControl default-value="Doe" />
              </FieldRoot>
              <button type="submit">submit</button>
            </Form>
          `,
        }),
      )

      await user.click(screen.getByText('submit'))
      await nextTick()

      expect(validateSpy).toHaveBeenCalledWith('John', expect.objectContaining({
        first: 'John',
        last: 'Doe',
      }))
    })
  })

  describe('prop: validationMode', () => {
    describe('onSubmit', () => {
      it('should validate the field on submit', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            setup() {
              return { validate: () => 'error' }
            },
            template: `
              <Form>
                <FieldRoot :validate="validate">
                  <FieldControl />
                  <FieldError data-testid="error" />
                </FieldRoot>
                <button type="submit">submit</button>
              </Form>
            `,
          }),
        )

        expect(screen.queryByTestId('error')).toBeNull()

        await user.click(screen.getByText('submit'))
        await nextTick()

        expect(screen.queryByTestId('error')).not.toBeNull()
      })

      it('revalidates on change after submit', async () => {
        const user = userEvent.setup()
        const validateSpy = vi.fn((value: unknown) => {
          return value === '' ? 'required' : null
        })

        render(
          createApp({
            setup() {
              return { validateSpy }
            },
            template: `
              <Form>
                <FieldRoot :validate="validateSpy">
                  <FieldControl data-testid="control" />
                  <FieldError data-testid="error" />
                </FieldRoot>
                <button type="submit">submit</button>
              </Form>
            `,
          }),
        )

        await user.click(screen.getByText('submit'))
        await nextTick()

        expect(screen.queryByTestId('error')).not.toBeNull()

        validateSpy.mockClear()
        const input = screen.getByTestId('control')
        await user.click(input)
        await user.keyboard('a')
        await nextTick()

        expect(validateSpy).toHaveBeenCalled()
        expect(screen.queryByTestId('error')).toBeNull()
      })
    })

    describe('onChange', () => {
      it('validates the field on change', async () => {
        const user = userEvent.setup()
        const validateSpy = vi.fn(() => 'error')

        render(
          createApp({
            setup() {
              return { validateSpy }
            },
            template: `
              <FieldRoot :validate="validateSpy" validation-mode="onChange">
                <FieldControl data-testid="control" />
                <FieldError data-testid="error" />
              </FieldRoot>
            `,
          }),
        )

        expect(screen.queryByTestId('error')).toBeNull()

        const input = screen.getByTestId('control')
        await user.click(input)
        await user.keyboard('a')
        await nextTick()

        expect(validateSpy).toHaveBeenCalled()
        expect(screen.queryByTestId('error')).not.toBeNull()
      })
    })

    describe('onBlur', () => {
      it('validates the field on blur', async () => {
        const user = userEvent.setup()
        const validateSpy = vi.fn(() => 'error')

        render(
          createApp({
            setup() {
              return { validateSpy }
            },
            template: `
              <FieldRoot :validate="validateSpy" validation-mode="onBlur">
                <FieldControl data-testid="control" />
                <FieldError data-testid="error" />
              </FieldRoot>
            `,
          }),
        )

        expect(screen.queryByTestId('error')).toBeNull()

        const input = screen.getByTestId('control')
        await user.click(input)
        await user.tab()
        await nextTick()

        expect(validateSpy).toHaveBeenCalled()
        expect(screen.queryByTestId('error')).not.toBeNull()
      })

      it('should not mark invalid if valueMissing is the only error and not yet dirtied', async () => {
        render(
          createApp({
            template: `
              <FieldRoot validation-mode="onBlur" data-testid="field">
                <FieldControl required />
              </FieldRoot>
            `,
          }),
        )

        const input = screen.getByRole('textbox')
        await fireEvent.focus(input)
        await fireEvent.blur(input)
        await nextTick()

        expect(screen.getByTestId('field')).not.toHaveAttribute('data-invalid')
      })

      it('should mark invalid if valueMissing is the only error and dirtied', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            template: `
              <FieldRoot validation-mode="onBlur" data-testid="field">
                <FieldControl required data-testid="control" />
              </FieldRoot>
            `,
          }),
        )

        const input = screen.getByTestId('control')
        await user.click(input)
        await user.keyboard('a')
        await user.keyboard('{Backspace}')
        await user.tab()
        await nextTick()

        expect(screen.getByTestId('field')).toHaveAttribute('data-invalid')
      })

      it('supports async validation', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            setup() {
              const validate = async () => {
                await new Promise(resolve => setTimeout(resolve, 10))
                return 'async error'
              }
              return { validate }
            },
            template: `
              <FieldRoot :validate="validate" validation-mode="onBlur">
                <FieldControl data-testid="control" />
                <FieldError data-testid="error" />
              </FieldRoot>
            `,
          }),
        )

        const input = screen.getByTestId('control')
        await user.click(input)
        await user.tab()

        await vi.waitFor(() => {
          expect(screen.queryByTestId('error')).not.toBeNull()
        })

        expect(screen.getByTestId('error').textContent).toBe('async error')
      })
    })
  })

  describe('prop: validationDebounceTime', () => {
    it('should debounce validation', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      const validateSpy = vi.fn(() => 'error')

      render(
        createApp({
          setup() {
            return { validateSpy }
          },
          template: `
            <FieldRoot :validate="validateSpy" validation-mode="onChange" :validation-debounce-time="200">
              <FieldControl data-testid="control" />
              <FieldError data-testid="error" />
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('control')
      await user.click(input)
      await user.keyboard('a')

      expect(validateSpy).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)
      await nextTick()

      expect(validateSpy).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('style hooks', () => {
    describe('touched', () => {
      it('should apply data-touched to all components when touched', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            template: `
              <FieldRoot data-testid="root">
                <FieldLabel data-testid="label">Label</FieldLabel>
                <FieldControl data-testid="control" />
                <FieldDescription data-testid="description">Desc</FieldDescription>
              </FieldRoot>
            `,
          }),
        )

        expect(screen.getByTestId('root')).not.toHaveAttribute('data-touched')

        await user.click(screen.getByTestId('control'))
        await user.tab()
        await nextTick()

        expect(screen.getByTestId('root')).toHaveAttribute('data-touched')
        expect(screen.getByTestId('label')).toHaveAttribute('data-touched')
        expect(screen.getByTestId('control')).toHaveAttribute('data-touched')
        expect(screen.getByTestId('description')).toHaveAttribute('data-touched')
      })
    })

    describe('dirty', () => {
      it('should apply data-dirty to all components when dirty', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            template: `
              <FieldRoot data-testid="root">
                <FieldLabel data-testid="label">Label</FieldLabel>
                <FieldControl data-testid="control" />
                <FieldDescription data-testid="description">Desc</FieldDescription>
              </FieldRoot>
            `,
          }),
        )

        expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty')

        const input = screen.getByTestId('control')
        await user.click(input)
        await user.keyboard('a')
        await nextTick()

        expect(screen.getByTestId('root')).toHaveAttribute('data-dirty')
        expect(screen.getByTestId('label')).toHaveAttribute('data-dirty')
        expect(screen.getByTestId('control')).toHaveAttribute('data-dirty')
        expect(screen.getByTestId('description')).toHaveAttribute('data-dirty')
      })
    })

    describe('filled', () => {
      it('should apply data-filled to all components when filled', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            template: `
              <FieldRoot data-testid="root">
                <FieldLabel data-testid="label">Label</FieldLabel>
                <FieldControl data-testid="control" />
                <FieldDescription data-testid="description">Desc</FieldDescription>
              </FieldRoot>
            `,
          }),
        )

        expect(screen.getByTestId('root')).not.toHaveAttribute('data-filled')

        const input = screen.getByTestId('control')
        await user.click(input)
        await user.keyboard('hello')
        await nextTick()

        expect(screen.getByTestId('root')).toHaveAttribute('data-filled')
        expect(screen.getByTestId('label')).toHaveAttribute('data-filled')
        expect(screen.getByTestId('control')).toHaveAttribute('data-filled')
        expect(screen.getByTestId('description')).toHaveAttribute('data-filled')
      })
    })

    describe('focused', () => {
      it('should apply data-focused to all components when focused', async () => {
        const user = userEvent.setup()

        render(
          createApp({
            template: `
              <FieldRoot data-testid="root">
                <FieldLabel data-testid="label">Label</FieldLabel>
                <FieldControl data-testid="control" />
                <FieldDescription data-testid="description">Desc</FieldDescription>
              </FieldRoot>
            `,
          }),
        )

        expect(screen.getByTestId('root')).not.toHaveAttribute('data-focused')

        await user.click(screen.getByTestId('control'))

        expect(screen.getByTestId('root')).toHaveAttribute('data-focused')
        expect(screen.getByTestId('label')).toHaveAttribute('data-focused')
        expect(screen.getByTestId('control')).toHaveAttribute('data-focused')
        expect(screen.getByTestId('description')).toHaveAttribute('data-focused')

        await user.tab()
        await nextTick()

        expect(screen.getByTestId('root')).not.toHaveAttribute('data-focused')
      })
    })
  })

  describe('prop: dirty', () => {
    it('controls the dirty state', () => {
      render(
        createApp({
          template: `
            <FieldRoot :dirty="true" data-testid="field">
              <FieldControl />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('field')).toHaveAttribute('data-dirty')
    })
  })

  describe('prop: touched', () => {
    it('controls the touched state', () => {
      render(
        createApp({
          template: `
            <FieldRoot :touched="true" data-testid="field">
              <FieldControl />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('field')).toHaveAttribute('data-touched')
    })
  })

  describe('defaultValue behavior', () => {
    it('should initialize with defaultValue', () => {
      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldControl default-value="initial" data-testid="control" />
            </FieldRoot>
          `,
        }),
      )

      expect(screen.getByTestId('control')).toHaveValue('initial')
    })

    it('should not reset to defaultValue on focus', async () => {
      const user = userEvent.setup()

      render(
        createApp({
          template: `
            <FieldRoot>
              <FieldControl default-value="initial" data-testid="control" />
              <button data-testid="btn">other</button>
            </FieldRoot>
          `,
        }),
      )

      const input = screen.getByTestId('control')
      await user.click(input)
      await user.clear(input)
      await user.keyboard('changed')
      expect(input).toHaveValue('changed')

      await user.click(screen.getByTestId('btn'))
      await user.click(input)
      expect(input).toHaveValue('changed')
    })
  })
})
