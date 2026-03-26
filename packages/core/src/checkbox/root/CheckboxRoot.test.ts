import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from '..'
import CheckboxGroup from '../../checkbox-group/CheckboxGroup.vue'
import { FieldDescription, FieldError, FieldLabel, FieldRoot } from '../../field/'
import Form from '../../form/Form.vue'

function createCheckboxApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      CheckboxGroup,
      CheckboxIndicator,
      CheckboxRoot,
      FieldDescription,
      FieldError,
      FieldLabel,
      FieldRoot,
      Form,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<CheckboxRoot />', () => {
  describe('interactions', () => {
    it('should change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        template: `<CheckboxRoot data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await user.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      await user.click(checkbox)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('should update its state when changed from outside', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        setup() {
          const checked = ref(false)
          return { checked }
        },
        template: `
          <div>
            <button type="button" @click="checked = !checked">Toggle</button>
            <CheckboxRoot :checked="checked" data-testid="checkbox" />
          </div>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')
      const button = screen.getByText('Toggle')

      expect(checkbox).toHaveAttribute('aria-checked', 'false')

      await user.click(button)
      expect(checkbox).toHaveAttribute('aria-checked', 'true')

      await user.click(button)
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('should call CheckedChange when clicked', async () => {
      const user = userEvent.setup()
      const handleCheckedChange = vi.fn()

      render(createCheckboxApp({
        setup() {
          return { handleCheckedChange }
        },
        template: `<CheckboxRoot data-testid="checkbox" @checked-change="handleCheckedChange" />`,
      }))

      await user.click(screen.getByTestId('checkbox'))

      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
      expect(handleCheckedChange.mock.calls[0][0]).toBe(true)
    })

    it('should report keyboard modifier event properties when calling CheckedChange', async () => {
      const user = userEvent.setup()
      const handleCheckedChange = vi.fn()

      render(createCheckboxApp({
        setup() {
          return { handleCheckedChange }
        },
        template: `<CheckboxRoot data-testid="checkbox" @checked-change="handleCheckedChange" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')
      await user.keyboard('{Shift>}')
      await user.click(checkbox)
      await user.keyboard('{/Shift}')

      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
      expect(handleCheckedChange.mock.calls[0][1].event.shiftKey).toBe(true)
    })

    it('should update its state if the underlying input is toggled', async () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement

      input.click()
      await nextTick()
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    ;['Enter', 'Space'].forEach((key) => {
      it(`can be activated with ${key} key`, async () => {
        const user = userEvent.setup()

        render(createCheckboxApp({
          template: `<CheckboxRoot data-testid="checkbox" />`,
        }))

        const checkbox = screen.getByTestId('checkbox')
        expect(checkbox).toHaveAttribute('aria-checked', 'false')

        await user.tab()
        expect(checkbox).toHaveFocus()

        await user.keyboard(`[${key}]`)
        expect(checkbox).toHaveAttribute('aria-checked', 'true')
      })
    })

    it('treats an empty string value as a valid grouped child key', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        setup() {
          const value = ref<string[]>([''])
          return { value }
        },
        template: `
          <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue">
            <CheckboxRoot value="" data-testid="empty-value" />
            <CheckboxRoot value="b" data-testid="other-value" />
          </CheckboxGroup>
        `,
      }))

      const emptyValueCheckbox = screen.getByTestId('empty-value')

      expect(emptyValueCheckbox).toHaveAttribute('aria-checked', 'true')

      await user.click(emptyValueCheckbox)
      expect(emptyValueCheckbox).toHaveAttribute('aria-checked', 'false')

      await user.click(emptyValueCheckbox)
      expect(emptyValueCheckbox).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('aRIA attributes', () => {
    it('sets the correct aria attributes', async () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot :required="false" data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveAttribute('aria-checked')
      expect(checkbox).not.toHaveAttribute('aria-required')

      await render(createCheckboxApp({
        template: `<CheckboxRoot required data-testid="required-checkbox" />`,
      }))

      expect(screen.getByTestId('required-checkbox')).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('extra props', () => {
    it('can override the built-in attributes', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot role="switch" />`,
      }))

      expect(screen.getByRole('switch')).toBeDefined()
    })
  })

  describe('prop: readOnly', () => {
    it('should have the `aria-readonly` attribute', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot read-only data-testid="checkbox" />`,
      }))

      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-readonly', 'true')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        template: `<CheckboxRoot read-only data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')

      await user.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-readonly', 'true')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    it('should not have the aria attribute when `readOnly` is not set', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot data-testid="checkbox" />`,
      }))

      expect(screen.getByTestId('checkbox')).not.toHaveAttribute('aria-readonly')
    })
  })

  describe('prop: disabled', () => {
    it('uses aria-disabled instead of HTML disabled', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot disabled data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).not.toHaveAttribute('disabled')
      expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        template: `<CheckboxRoot disabled data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')

      await user.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-disabled', 'true')
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: indeterminate', () => {
    it('should set the `aria-checked` attribute as "mixed"', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot indeterminate data-testid="checkbox" />`,
      }))

      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        template: `<CheckboxRoot indeterminate data-testid="checkbox" />`,
      }))

      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')

      await user.click(checkbox)

      expect(checkbox).toHaveAttribute('aria-checked', 'mixed')
    })

    it('should not have the aria attribute when `indeterminate` is not set', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot data-testid="checkbox" />`,
      }))

      expect(screen.getByTestId('checkbox')).not.toHaveAttribute('aria-checked', 'mixed')
    })

    it('should not be overridden by `checked` prop', () => {
      render(createCheckboxApp({
        template: `<CheckboxRoot indeterminate checked data-testid="checkbox" />`,
      }))

      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    })
  })

  it('renders the indicator when checked', () => {
    render(createCheckboxApp({
      template: `
        <CheckboxRoot checked>
          <CheckboxIndicator data-testid="indicator" />
        </CheckboxRoot>
      `,
    }))

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('should place the style hooks on the root and the indicator', async () => {
    const user = userEvent.setup()

    render(createCheckboxApp({
      template: `
        <CheckboxRoot data-testid="checkbox" :default-checked="true" disabled read-only required>
          <CheckboxIndicator data-testid="indicator" />
        </CheckboxRoot>
      `,
    }))

    const checkbox = screen.getByTestId('checkbox')
    const indicator = screen.getByTestId('indicator')

    expect(checkbox).toHaveAttribute('data-checked')
    expect(checkbox).toHaveAttribute('data-disabled')
    expect(checkbox).toHaveAttribute('data-readonly')
    expect(checkbox).toHaveAttribute('data-required')

    expect(indicator).toHaveAttribute('data-checked')
    expect(indicator).toHaveAttribute('data-disabled')
    expect(indicator).toHaveAttribute('data-readonly')
    expect(indicator).toHaveAttribute('data-required')

    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })

  it('should set the name attribute only on the input', () => {
    render(createCheckboxApp({
      template: `<CheckboxRoot name="checkbox-name" data-testid="checkbox" />`,
    }))

    const checkbox = screen.getByTestId('checkbox')
    const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement

    expect(input).toHaveAttribute('name', 'checkbox-name')
    expect(checkbox).not.toHaveAttribute('name')
  })

  describe('with native <label>', () => {
    it('should toggle the checkbox when a wrapping <label> is clicked', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        template: `
          <label data-testid="label">
            <CheckboxRoot data-testid="checkbox" />
            Toggle
          </label>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')
      await user.click(screen.getByTestId('label'))
      await nextTick()

      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('should toggle the checkbox when a explicitly linked <label> is clicked', async () => {
      render(createCheckboxApp({
        template: `
          <div>
            <label data-testid="label" for="myCheckbox">Toggle</label>
            <CheckboxRoot id="myCheckbox" data-testid="checkbox" />
          </div>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')
      fireEvent.click(screen.getByTestId('label'))
      await nextTick()

      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })

    it('should associate `id` with the native button when `nativeButton=true`', async () => {
      render(createCheckboxApp({
        template: `
          <div>
            <label data-testid="label" for="myCheckbox">Toggle</label>
            <CheckboxRoot
              id="myCheckbox"
              :native-button="true"
              as="button"
              data-testid="checkbox"
            />
          </div>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')
      const hiddenInput = document.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox).toHaveAttribute('id', 'myCheckbox')
      expect(hiddenInput).not.toHaveAttribute('id', 'myCheckbox')

      fireEvent.click(screen.getByTestId('label'))
      await nextTick()

      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('form', () => {
    it('clears external errors on change', async () => {
      render(createCheckboxApp({
        setup() {
          return {
            errors: { test: 'test' },
          }
        },
        template: `
          <Form :errors="errors">
            <FieldRoot name="test">
              <CheckboxRoot data-testid="checkbox" />
              <FieldError data-testid="error" />
            </FieldRoot>
          </Form>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')

      expect(checkbox).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error').textContent).toContain('test')

      fireEvent.click(checkbox)
      await nextTick()

      expect(checkbox).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBeNull()
    })
  })

  describe('field', () => {
    it('should receive disabled prop from FieldRoot', () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot disabled>
            <CheckboxRoot data-testid="checkbox" />
          </FieldRoot>
        `,
      }))

      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-disabled', 'true')
    })

    it('should receive name prop from FieldRoot', () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot name="field-checkbox">
            <CheckboxRoot data-testid="checkbox" />
          </FieldRoot>
        `,
      }))

      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement
      expect(input).toHaveAttribute('name', 'field-checkbox')
    })

    it('[data-touched]', async () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot>
            <CheckboxRoot data-testid="button" />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      fireEvent.focus(button)
      fireEvent.blur(button)
      await nextTick()

      expect(button).toHaveAttribute('data-touched', '')
    })

    it('[data-dirty]', async () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot>
            <CheckboxRoot data-testid="button" />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      expect(button).not.toHaveAttribute('data-dirty')

      fireEvent.click(button)
      await nextTick()

      expect(button).toHaveAttribute('data-dirty', '')
    })

    describe('[data-filled]', () => {
      it('adds [data-filled] attribute when checked after being initially unchecked', async () => {
        render(createCheckboxApp({
          template: `
            <FieldRoot>
              <CheckboxRoot data-testid="button" />
            </FieldRoot>
          `,
        }))

        const button = screen.getByTestId('button')

        expect(button).not.toHaveAttribute('data-filled')

        fireEvent.click(button)
        await nextTick()

        expect(button).toHaveAttribute('data-filled', '')

        fireEvent.click(button)
        await nextTick()

        expect(button).not.toHaveAttribute('data-filled')
      })

      it('removes [data-filled] attribute when unchecked after being initially checked', async () => {
        render(createCheckboxApp({
          template: `
            <FieldRoot>
              <CheckboxRoot data-testid="button" default-checked />
            </FieldRoot>
          `,
        }))

        const button = screen.getByTestId('button')

        expect(button).toHaveAttribute('data-filled')

        fireEvent.click(button)
        await nextTick()

        expect(button).not.toHaveAttribute('data-filled', '')
      })

      it('adds [data-filled] attribute when any checkbox is filled when inside a group', async () => {
        render(createCheckboxApp({
          template: `
            <FieldRoot>
              <CheckboxGroup :default-value="['1', '2']">
                <CheckboxRoot value="1" data-testid="button-1" />
                <CheckboxRoot value="2" data-testid="button-2" />
              </CheckboxGroup>
            </FieldRoot>
          `,
        }))

        const button1 = screen.getByTestId('button-1')
        const button2 = screen.getByTestId('button-2')

        expect(button1).toHaveAttribute('data-filled')
        expect(button2).toHaveAttribute('data-filled')

        fireEvent.click(button1)
        await nextTick()

        expect(button1).toHaveAttribute('data-filled')
        expect(button2).toHaveAttribute('data-filled')

        fireEvent.click(button2)
        await nextTick()

        expect(button1).not.toHaveAttribute('data-filled')
        expect(button2).not.toHaveAttribute('data-filled')
      })
    })

    it('[data-focused]', async () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot>
            <CheckboxRoot data-testid="button" />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      expect(button).not.toHaveAttribute('data-focused')

      fireEvent.focus(button)
      await nextTick()

      expect(button).toHaveAttribute('data-focused', '')

      fireEvent.blur(button)
      await nextTick()

      expect(button).not.toHaveAttribute('data-focused')
    })

    it('[data-invalid]', () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot invalid>
            <CheckboxRoot data-testid="button" />
          </FieldRoot>
        `,
      }))

      expect(screen.getByTestId('button')).toHaveAttribute('data-invalid', '')
    })

    it('[data-valid]', async () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot validation-mode="onBlur">
            <CheckboxRoot data-testid="button" required />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      expect(button).not.toHaveAttribute('data-valid')
      expect(button).not.toHaveAttribute('data-invalid')

      fireEvent.click(button)
      fireEvent.focus(button)
      fireEvent.blur(button)
      await nextTick()

      expect(button).toHaveAttribute('data-valid', '')
      expect(button).not.toHaveAttribute('data-invalid')
    })

    it('prop: validationMode=onSubmit', async () => {
      render(createCheckboxApp({
        template: `
          <Form>
            <FieldRoot>
              <CheckboxRoot required data-testid="checkbox" />
              <FieldError data-testid="error" />
            </FieldRoot>
            <button type="submit">submit</button>
          </Form>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).not.toHaveAttribute('aria-invalid')

      fireEvent.click(checkbox)
      await nextTick()
      expect(checkbox).toHaveAttribute('data-checked', '')
      fireEvent.click(checkbox)
      await nextTick()
      expect(checkbox).toHaveAttribute('data-unchecked', '')
      expect(checkbox).not.toHaveAttribute('aria-invalid')

      fireEvent.click(screen.getByText('submit'))
      await nextTick()
      expect(checkbox).toHaveAttribute('aria-invalid', 'true')

      fireEvent.click(checkbox)
      await nextTick()
      expect(checkbox).toHaveAttribute('data-checked', '')
      expect(checkbox).not.toHaveAttribute('aria-invalid')

      fireEvent.click(checkbox)
      await nextTick()
      expect(checkbox).toHaveAttribute('data-unchecked', '')
      expect(checkbox).toHaveAttribute('aria-invalid', 'true')

      fireEvent.click(checkbox)
      await nextTick()
      expect(checkbox).toHaveAttribute('data-checked', '')
      expect(checkbox).not.toHaveAttribute('aria-invalid')
    })

    it('props: validationMode=onChange', async () => {
      render(createCheckboxApp({
        setup() {
          return {
            validate: (value: unknown) => (value as boolean ? 'error' : null),
          }
        },
        template: `
          <FieldRoot validation-mode="onChange" :validate="validate">
            <CheckboxRoot data-testid="button" />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      expect(button).not.toHaveAttribute('aria-invalid')

      fireEvent.click(button)
      await nextTick()

      expect(button).toHaveAttribute('aria-invalid', 'true')
    })

    it('revalidates when a controlled value changes externally', async () => {
      const validateSpy = vi.fn((value: unknown) => ((value as boolean) ? 'error' : null))

      render(createCheckboxApp({
        setup() {
          const checked = ref(false)
          return { checked, validateSpy }
        },
        template: `
          <div>
            <FieldRoot validation-mode="onChange" :validate="validateSpy" name="terms">
              <CheckboxRoot data-testid="button" :checked="checked" @checked-change="checked = $event" />
            </FieldRoot>
            <button type="button" @click="checked = !checked">Toggle externally</button>
          </div>
        `,
      }))

      const button = screen.getByTestId('button')
      const toggle = screen.getByText('Toggle externally')

      expect(button).not.toHaveAttribute('aria-invalid')
      const initialCallCount = validateSpy.mock.calls.length

      fireEvent.click(toggle)
      await nextTick()

      expect(validateSpy.mock.calls.length).toBe(initialCallCount + 1)
      expect(validateSpy.mock.lastCall?.[0]).toBe(true)
      expect(button).toHaveAttribute('aria-invalid', 'true')
    })

    it('prop: validationMode=onBlur', async () => {
      render(createCheckboxApp({
        setup() {
          return {
            validate: (value: unknown) => (value as boolean ? 'error' : null),
          }
        },
        template: `
          <FieldRoot validation-mode="onBlur" :validate="validate">
            <CheckboxRoot data-testid="button" />
            <FieldError data-testid="error" />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      expect(button).not.toHaveAttribute('aria-invalid')

      fireEvent.click(button)
      fireEvent.blur(button)
      await nextTick()

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-invalid', 'true')
      })
    })

    describe('fieldLabel', () => {
      describe('explicit association', () => {
        it('when label and checkbox are siblings', async () => {
          render(createCheckboxApp({
            template: `
              <FieldRoot>
                <FieldLabel>Label</FieldLabel>
                <CheckboxRoot />
              </FieldRoot>
            `,
          }))
          await nextTick()

          const label = screen.getByText('Label')
          expect(label.getAttribute('id')).not.toBe(null)

          const input = document.querySelector('input[type="checkbox"]')
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))

          const checkbox = screen.getByRole('checkbox')
          expect(checkbox.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
          expect(checkbox).toHaveAttribute('aria-checked', 'false')

          fireEvent.click(label)
          await nextTick()
          expect(checkbox).toHaveAttribute('aria-checked', 'true')
        })
      })

      describe('implicit association', () => {
        it('sets `for` on the label', async () => {
          render(createCheckboxApp({
            template: `
              <FieldRoot>
                <FieldLabel data-testid="label">
                  <CheckboxRoot />
                  OK
                </FieldLabel>
              </FieldRoot>
            `,
          }))
          await nextTick()

          const label = screen.getByTestId('label')
          const input = document.querySelector('input[type="checkbox"]')
          expect(label.getAttribute('for')).not.toBe(null)
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))

          const checkbox = screen.getByRole('checkbox')
          expect(label.getAttribute('id')).not.toBe(null)
          expect(checkbox.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))

          expect(checkbox).toHaveAttribute('aria-checked', 'false')
          fireEvent.click(screen.getByText('OK'))
          await nextTick()
          expect(checkbox).toHaveAttribute('aria-checked', 'true')
        })
      })
    })

    it('fieldDescription', async () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot>
            <CheckboxRoot data-testid="button" />
            <FieldDescription data-testid="description" />
          </FieldRoot>
        `,
      }))
      await nextTick()

      expect(screen.getByTestId('button')).toHaveAttribute(
        'aria-describedby',
        screen.getByTestId('description').id,
      )
    })

    it('receives disabled and name from FieldRoot', () => {
      render(createCheckboxApp({
        template: `
          <FieldRoot disabled name="field-checkbox">
            <CheckboxRoot data-testid="checkbox" />
          </FieldRoot>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')
      const input = document.querySelector('input[type="checkbox"]') as HTMLInputElement

      expect(checkbox).toHaveAttribute('aria-disabled', 'true')
      expect(input).toHaveAttribute('name', 'field-checkbox')
    })

    it('updates touched, dirty, focused, filled, and invalid/valid attributes', async () => {
      const user = userEvent.setup()

      render(createCheckboxApp({
        template: `
          <FieldRoot validation-mode="onBlur">
            <CheckboxRoot required data-testid="checkbox" />
          </FieldRoot>
        `,
      }))

      const checkbox = screen.getByTestId('checkbox')

      await user.tab()
      await nextTick()
      expect(checkbox).toHaveAttribute('data-focused')

      await user.tab()
      await nextTick()
      expect(checkbox).toHaveAttribute('data-touched')
      expect(checkbox).not.toHaveAttribute('data-focused')

      await user.click(checkbox)
      await user.tab()
      await user.tab()
      await nextTick()

      expect(checkbox).toHaveAttribute('data-dirty')
      expect(checkbox).toHaveAttribute('data-filled')
      expect(checkbox).toHaveAttribute('data-valid')
      expect(checkbox).not.toHaveAttribute('data-invalid')
    })
  })

  it('should change state when clicking the checkbox if it has a wrapping label', async () => {
    render(createCheckboxApp({
      template: `
        <label data-testid="label">
          <CheckboxRoot />
          Toggle
        </label>
      `,
    }))

    const checkbox = screen.getByRole('checkbox')

    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(checkbox)
    await nextTick()

    expect(checkbox).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(checkbox)
    await nextTick()

    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  it('sets `aria-labelledby` from a sibling label associated with the hidden input', async () => {
    render(createCheckboxApp({
      template: `
        <div>
          <label for="checkbox-input">Label</label>
          <CheckboxRoot id="checkbox-input" />
        </div>
      `,
    }))
    await nextTick()

    const label = screen.getByText('Label')
    expect(label.id).not.toBe('')
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-labelledby', label.id)
  })

  it('updates fallback `aria-labelledby` when the hidden input id changes', async () => {
    render(createCheckboxApp({
      setup() {
        const id = ref('checkbox-input-a')
        return { id }
      },
      template: `
        <div>
          <label for="checkbox-input-a">Label A</label>
          <label for="checkbox-input-b">Label B</label>
          <CheckboxRoot :id="id" />
          <button type="button" @click="id = 'checkbox-input-b'">Toggle</button>
        </div>
      `,
    }))
    await nextTick()

    const checkbox = screen.getByRole('checkbox')
    const labelA = screen.getByText('Label A')

    expect(labelA.id).not.toBe('')
    expect(checkbox).toHaveAttribute('aria-labelledby', labelA.id)

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))

    await waitFor(() => {
      const labelB = screen.getByText('Label B')

      expect(labelB.id).not.toBe('')
      expect(labelA.id).not.toBe(labelB.id)
      expect(checkbox).toHaveAttribute('aria-labelledby', labelB.id)
    })
  })

  it('can render a native button', async () => {
    const user = userEvent.setup()

    render(createCheckboxApp({
      template: `<CheckboxRoot as="button" native-button data-testid="checkbox" />`,
    }))

    const checkbox = screen.getByTestId('checkbox')

    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await user.tab()
    expect(checkbox).toHaveFocus()

    await user.keyboard('[Enter]')
    expect(checkbox).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('[Space]')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
  })
})
