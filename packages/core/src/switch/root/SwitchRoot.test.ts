import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { SwitchRoot, SwitchThumb } from '..'
import { FieldDescription, FieldError, FieldLabel, FieldRoot } from '../../field'
import Form from '../../form/Form.vue'

function createSwitchApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      FieldDescription,
      FieldError,
      FieldLabel,
      FieldRoot,
      Form,
      SwitchRoot,
      SwitchThumb,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<SwitchRoot />', () => {
  describe('interactions', () => {
    it('should change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `<SwitchRoot />`,
      }))

      const switchElement = screen.getByRole('switch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('should update its state when changed from outside', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        setup() {
          const checked = ref(false)
          return { checked }
        },
        template: `
          <div>
            <button type="button" @click="checked = !checked">Toggle</button>
            <SwitchRoot :checked="checked" />
          </div>
        `,
      }))

      const switchElement = screen.getByRole('switch')
      const button = screen.getByText('Toggle')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(button)
      expect(switchElement).toHaveAttribute('aria-checked', 'true')

      await user.click(button)
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })

    it('should update its state if the underlying input is toggled', async () => {
      render(createSwitchApp({
        template: `<SwitchRoot />`,
      }))

      const switchElement = screen.getByRole('switch')
      const internalInput = screen.getByRole('checkbox', { hidden: true }) as HTMLInputElement

      internalInput.click()
      await nextTick()

      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    });

    ['Enter', 'Space'].forEach((key) => {
      it(`can be activated with ${key} key`, async () => {
        const user = userEvent.setup()

        render(createSwitchApp({
          template: `<SwitchRoot />`,
        }))

        const switchElement = screen.getByRole('switch')
        expect(switchElement).toHaveAttribute('aria-checked', 'false')

        await user.tab()
        expect(switchElement).toHaveFocus()

        await user.keyboard(`[${key}]`)
        expect(switchElement).toHaveAttribute('aria-checked', 'true')
      })
    })
  })

  describe('extra props', () => {
    it('should override the built-in attributes', () => {
      render(createSwitchApp({
        template: `<SwitchRoot role="checkbox" data-testid="switch" />`,
      }))

      expect(screen.getByTestId('switch')).toHaveAttribute('role', 'checkbox')
    })

    it('sets `aria-labelledby` from a sibling label associated with the hidden input', async () => {
      render(createSwitchApp({
        template: `
          <div>
            <label for="switch-input">Label</label>
            <SwitchRoot id="switch-input" />
          </div>
        `,
      }))
      await nextTick()

      const label = screen.getByText('Label')
      expect(label.id).not.toBe('')
      expect(screen.getByRole('switch')).toHaveAttribute('aria-labelledby', label.id)
    })

    it('updates fallback `aria-labelledby` when the hidden input id changes', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        setup() {
          const id = ref('switch-input-a')
          return { id }
        },
        template: `
          <div>
            <label for="switch-input-a">Label A</label>
            <label for="switch-input-b">Label B</label>
            <SwitchRoot :id="id" />
            <button type="button" @click="id = 'switch-input-b'">Toggle</button>
          </div>
        `,
      }))
      await nextTick()

      const switchElement = screen.getByRole('switch')
      const labelA = screen.getByText('Label A')

      expect(labelA.id).not.toBe('')
      expect(switchElement).toHaveAttribute('aria-labelledby', labelA.id)

      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      await waitFor(() => {
        const labelB = screen.getByText('Label B')

        expect(labelB.id).not.toBe('')
        expect(labelA.id).not.toBe(labelB.id)
        expect(switchElement).toHaveAttribute('aria-labelledby', labelB.id)
      })
    })
  })

  describe('emits: checked-change', () => {
    it('should call @checked-change when clicked', async () => {
      const user = userEvent.setup()
      const handleCheckedChange = vi.fn()

      render(createSwitchApp({
        setup() {
          return { handleCheckedChange }
        },
        template: `<SwitchRoot @checked-change="handleCheckedChange" />`,
      }))

      await user.click(screen.getByRole('switch'))

      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
      expect(handleCheckedChange.mock.calls[0][0]).toBe(true)
    })

    it('should report keyboard modifier event properties when calling CheckedChange', async () => {
      const user = userEvent.setup()
      const handleCheckedChange = vi.fn()

      render(createSwitchApp({
        setup() {
          return { handleCheckedChange }
        },
        template: `<SwitchRoot @checked-change="handleCheckedChange" />`,
      }))

      const switchElement = screen.getByRole('switch')

      await user.keyboard('{Shift>}')
      await user.click(switchElement)
      await user.keyboard('{/Shift}')

      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
      expect(handleCheckedChange.mock.calls[0][1].event.shiftKey).toBe(true)
    })
  })

  describe('emits: click', () => {
    it('should call @click when clicked', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      render(createSwitchApp({
        setup() {
          return { handleClick }
        },
        template: `<SwitchRoot @click="handleClick" />`,
      }))

      await user.click(screen.getByRole('switch'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('prop: disabled', () => {
    it('uses aria-disabled instead of HTML disabled', () => {
      render(createSwitchApp({
        template: `<SwitchRoot disabled />`,
      }))

      const switchElement = screen.getByRole('switch')
      expect(switchElement).not.toHaveAttribute('disabled')
      expect(switchElement).toHaveAttribute('aria-disabled', 'true')
    })

    it('should not have the `disabled` attribute when `disabled` is not set', () => {
      render(createSwitchApp({
        template: `<SwitchRoot />`,
      }))

      expect(screen.getByRole('switch')).not.toHaveAttribute('disabled')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `<SwitchRoot disabled />`,
      }))

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: readOnly', () => {
    it('should have the `aria-readonly` attribute', () => {
      render(createSwitchApp({
        template: `<SwitchRoot read-only />`,
      }))

      expect(screen.getByRole('switch')).toHaveAttribute('aria-readonly', 'true')
    })

    it('should not have the aria attribute when `readOnly` is not set', () => {
      render(createSwitchApp({
        template: `<SwitchRoot />`,
      }))

      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-readonly')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `<SwitchRoot read-only />`,
      }))

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(switchElement)
      expect(switchElement).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: required', () => {
    it('should have the `aria-required` attribute', () => {
      render(createSwitchApp({
        template: `<SwitchRoot required />`,
      }))

      expect(screen.getByRole('switch')).toHaveAttribute('aria-required', 'true')
    })

    it('should not have the aria attribute when `required` is not set', () => {
      render(createSwitchApp({
        template: `<SwitchRoot />`,
      }))

      expect(screen.getByRole('switch')).not.toHaveAttribute('aria-required')
    })
  })

  describe('prop: inputRef', () => {
    it('should be able to access the native input', async () => {
      const inputRef = ref<HTMLInputElement | null>(null)

      render(createSwitchApp({
        setup() {
          function setInputRef(element: HTMLInputElement | null) {
            inputRef.value = element
          }

          return { setInputRef }
        },
        template: `<SwitchRoot :input-ref="setInputRef" />`,
      }))
      await nextTick()

      const internalInput = screen.getByRole('checkbox', { hidden: true })
      expect(inputRef.value).toBe(internalInput)
    })
  })

  it('should place the style hooks on the root and the thumb', async () => {
    const user = userEvent.setup()

    render(createSwitchApp({
      template: `
        <SwitchRoot
          :default-checked="true"
          disabled
          read-only
          required
        >
          <SwitchThumb data-testid="thumb" />
        </SwitchRoot>
      `,
    }))

    const switchElement = screen.getByRole('switch')
    const thumb = screen.getByTestId('thumb')

    expect(switchElement).toHaveAttribute('data-checked', '')
    expect(switchElement).toHaveAttribute('data-disabled', '')
    expect(switchElement).toHaveAttribute('data-readonly', '')
    expect(switchElement).toHaveAttribute('data-required', '')

    expect(thumb).toHaveAttribute('data-checked', '')
    expect(thumb).toHaveAttribute('data-disabled', '')
    expect(thumb).toHaveAttribute('data-readonly', '')
    expect(thumb).toHaveAttribute('data-required', '')

    render(createSwitchApp({
      template: `
        <SwitchRoot data-testid="second-switch">
          <SwitchThumb data-testid="second-thumb" />
        </SwitchRoot>
      `,
    }))

    const secondSwitch = screen.getByTestId('second-switch')
    const secondThumb = screen.getByTestId('second-thumb')

    await user.click(secondSwitch)

    expect(secondSwitch).toHaveAttribute('data-checked', '')
    expect(secondThumb).toHaveAttribute('data-checked', '')
  })

  it('should set the name attribute only on the input', () => {
    render(createSwitchApp({
      template: `<SwitchRoot name="switch-name" />`,
    }))

    const switchElement = screen.getByRole('switch')
    const input = screen.getByRole('checkbox', { hidden: true })

    expect(input).toHaveAttribute('name', 'switch-name')
    expect(switchElement).not.toHaveAttribute('name')
  })

  it('should not set the value attribute by default', () => {
    render(createSwitchApp({
      template: `<SwitchRoot />`,
    }))

    const input = screen.getByRole('checkbox', { hidden: true })
    expect(input).not.toHaveAttribute('value')
  })

  it('should set the value attribute only on the input', () => {
    render(createSwitchApp({
      template: `<SwitchRoot value="1" />`,
    }))

    const switchElement = screen.getByRole('switch')
    const input = screen.getByRole('checkbox', { hidden: true })

    expect(input).toHaveAttribute('value', '1')
    expect(switchElement).not.toHaveAttribute('value')
  })

  describe('with native <label>', () => {
    it('should toggle the switch when a wrapping <label> is clicked', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `
          <label data-testid="label">
            <SwitchRoot />
            Toggle
          </label>
        `,
      }))

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(screen.getByTestId('label'))
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('should toggle the switch when a explicitly linked <label> is clicked', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `
          <div>
            <label data-testid="label" for="mySwitch">Toggle</label>
            <SwitchRoot id="mySwitch" />
          </div>
        `,
      }))

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('aria-checked', 'false')

      await user.click(screen.getByTestId('label'))
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })

    it('should associate `id` with the native button when `nativeButton=true`', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `
          <div>
            <label data-testid="label" for="mySwitch">Toggle</label>
            <SwitchRoot id="mySwitch" as="button" :native-button="true" />
          </div>
        `,
      }))

      const switchElement = screen.getByRole('switch')
      expect(switchElement).toHaveAttribute('id', 'mySwitch')

      const hiddenInput = screen.getByRole('checkbox', { hidden: true })
      expect(hiddenInput).not.toHaveAttribute('id', 'mySwitch')

      expect(switchElement).toHaveAttribute('aria-checked', 'false')
      await user.click(screen.getByTestId('label'))
      expect(switchElement).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('form', () => {
    it('should include the switch value in form submission, matching native checkbox behavior', async () => {
      render(createSwitchApp({
        template: `
          <Form data-testid="form">
            <FieldRoot name="test-switch">
              <SwitchRoot />
            </FieldRoot>
          </Form>
        `,
      }))

      const form = screen.getByTestId('form') as HTMLFormElement
      let formData = new FormData(form)
      expect(formData.get('test-switch')).toBe(null)

      fireEvent.click(screen.getByRole('switch'))
      await nextTick()
      formData = new FormData(form)
      expect(formData.get('test-switch')).toBe('on')
    })

    it('matches native checkbox form submission behavior', async () => {
      const nativeSubmitSpy = vi.fn((event: Event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return {
          get: formData.get('native'),
          getAll: formData.getAll('native'),
        }
      })

      const customSubmitSpy = vi.fn((event: Event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return {
          get: formData.get('custom'),
          getAll: formData.getAll('custom'),
        }
      })

      const nativeUser = userEvent.setup()
      render(defineComponent({
        setup() {
          return { nativeSubmitSpy }
        },
        template: `
          <form @submit="nativeSubmitSpy">
            <input type="checkbox" name="native">
            <button type="submit">Submit</button>
          </form>
        `,
      }))

      const nativeCheckbox = screen.getByRole('checkbox')
      const nativeSubmitButton = screen.getByRole('button', { name: 'Submit' })

      await nativeUser.click(nativeSubmitButton)
      expect(nativeSubmitSpy.mock.results.at(-1)?.value.get).toBe(null)
      expect(nativeSubmitSpy.mock.results.at(-1)?.value.getAll).toEqual([])

      await nativeUser.click(nativeCheckbox)
      await nativeUser.click(nativeSubmitButton)
      expect(nativeSubmitSpy.mock.results.at(-1)?.value.get).toBe('on')

      const customUser = userEvent.setup()
      render(createSwitchApp({
        setup() {
          return { customSubmitSpy }
        },
        template: `
          <form @submit="customSubmitSpy">
            <FieldRoot name="custom">
              <SwitchRoot />
            </FieldRoot>
            <button type="submit">Submit</button>
          </form>
        `,
      }))

      const customSwitch = screen.getByRole('switch')
      const customSubmitButton = screen.getAllByRole('button', { name: 'Submit' })[1]

      await customUser.click(customSubmitButton)
      expect(customSubmitSpy.mock.results.at(-1)?.value.get).toBe(null)
      expect(customSubmitSpy.mock.results.at(-1)?.value.getAll).toEqual([])

      await customUser.click(customSwitch)
      await customUser.click(customSubmitButton)
      expect(customSubmitSpy.mock.results.at(-1)?.value.get).toBe('on')
    })

    it('submits to an external form when `form` is provided', () => {
      render(createSwitchApp({
        template: `
          <div>
            <form id="external-form" data-testid="form" />
            <SwitchRoot name="test-switch" form="external-form" />
          </div>
        `,
      }))

      fireEvent.click(screen.getByRole('switch'))

      const form = screen.getByTestId('form') as HTMLFormElement
      const formData = new FormData(form)
      expect(formData.get('test-switch')).toBe('on')
    })

    it('submits uncheckedValue to an external form when off', () => {
      render(createSwitchApp({
        template: `
          <div>
            <form id="external-form" data-testid="form" />
            <SwitchRoot name="test-switch" form="external-form" unchecked-value="off" />
          </div>
        `,
      }))

      const form = screen.getByTestId('form') as HTMLFormElement
      const formData = new FormData(form)
      expect(formData.get('test-switch')).toBe('off')
    })

    it('should submit uncheckedValue when switch is off and uncheckedValue is specified', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: Event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return formData.get('test-switch')
      })

      render(createSwitchApp({
        setup() {
          return { submitSpy }
        },
        template: `
          <form @submit="submitSpy">
            <FieldRoot name="test-switch">
              <SwitchRoot unchecked-value="off" />
            </FieldRoot>
            <button type="submit">Submit</button>
          </form>
        `,
      }))

      const switchElement = screen.getByRole('switch')
      const submitButton = screen.getByRole('button', { name: 'Submit' })

      await user.click(submitButton)
      expect(submitSpy).toHaveBeenCalledTimes(1)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('off')

      await user.click(switchElement)
      await user.click(submitButton)
      expect(submitSpy).toHaveBeenCalledTimes(2)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('on')

      await user.click(switchElement)
      await user.click(submitButton)
      expect(submitSpy).toHaveBeenCalledTimes(3)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('off')
    })

    it('should submit custom uncheckedValue when switch is off', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn((event: Event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget as HTMLFormElement)
        return formData.get('test-switch')
      })

      render(createSwitchApp({
        setup() {
          return { submitSpy }
        },
        template: `
          <form @submit="submitSpy">
            <FieldRoot name="test-switch">
              <SwitchRoot unchecked-value="false" />
            </FieldRoot>
            <button type="submit">Submit</button>
          </form>
        `,
      }))

      const switchElement = screen.getByRole('switch')
      const submitButton = screen.getByRole('button', { name: 'Submit' })

      await user.click(submitButton)
      expect(submitSpy).toHaveBeenCalledTimes(1)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('false')

      await user.click(switchElement)
      await user.click(submitButton)
      expect(submitSpy).toHaveBeenCalledTimes(2)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('on')

      await user.click(switchElement)
      await user.click(submitButton)
      expect(submitSpy).toHaveBeenCalledTimes(3)
      expect(submitSpy.mock.results.at(-1)?.value).toBe('false')
    })

    it('triggers native HTML validation on submit', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `
          <Form>
            <FieldRoot name="test">
              <SwitchRoot name="switch" required />
              <FieldError match="valueMissing" data-testid="error">
                required
              </FieldError>
            </FieldRoot>
            <button type="submit">Submit</button>
          </Form>
        `,
      }))

      expect(screen.queryByTestId('error')).toBe(null)

      await user.click(screen.getByText('Submit'))

      const error = screen.getByTestId('error')
      expect(error).toHaveTextContent('required')
    })

    it('clears external errors on change', async () => {
      render(createSwitchApp({
        template: `
          <Form :errors="{ test: 'test' }">
            <FieldRoot name="test">
              <SwitchRoot data-testid="switch" />
              <FieldError data-testid="error" />
            </FieldRoot>
          </Form>
        `,
      }))

      const switchElement = screen.getByTestId('switch')

      expect(switchElement).toHaveAttribute('aria-invalid', 'true')
      expect(screen.queryByTestId('error')).toHaveTextContent('test')

      fireEvent.click(switchElement)
      await nextTick()

      expect(switchElement).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBe(null)
    })
  })

  describe('field', () => {
    it('should receive disabled prop from FieldRoot', () => {
      render(createSwitchApp({
        template: `
          <FieldRoot disabled>
            <SwitchRoot />
          </FieldRoot>
        `,
      }))

      expect(screen.getByRole('switch')).toHaveAttribute('data-disabled')
    })

    it('should receive name prop from FieldRoot', () => {
      render(createSwitchApp({
        template: `
          <FieldRoot name="field-switch">
            <SwitchRoot />
          </FieldRoot>
        `,
      }))

      const input = screen.getByRole('checkbox', { hidden: true })
      expect(input).toHaveAttribute('name', 'field-switch')
    })

    it('[data-touched]', async () => {
      render(createSwitchApp({
        template: `
          <FieldRoot>
            <SwitchRoot data-testid="button" />
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
      render(createSwitchApp({
        template: `
          <FieldRoot>
            <SwitchRoot data-testid="button" />
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
        render(createSwitchApp({
          template: `
            <FieldRoot>
              <SwitchRoot data-testid="button" />
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
        render(createSwitchApp({
          template: `
            <FieldRoot>
              <SwitchRoot data-testid="button" :default-checked="true" />
            </FieldRoot>
          `,
        }))

        const button = screen.getByTestId('button')

        expect(button).toHaveAttribute('data-filled')
        fireEvent.click(button)
        await nextTick()
        expect(button).not.toHaveAttribute('data-filled')
      })
    })

    it('[data-focused]', async () => {
      render(createSwitchApp({
        template: `
          <FieldRoot>
            <SwitchRoot data-testid="button" />
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

    it('prop: validationMode=onSubmit', async () => {
      const user = userEvent.setup()

      render(createSwitchApp({
        template: `
          <Form>
            <FieldRoot>
              <SwitchRoot required />
              <FieldError data-testid="error" />
            </FieldRoot>
            <button type="submit">submit</button>
          </Form>
        `,
      }))

      const button = screen.getByRole('switch')
      expect(button).not.toHaveAttribute('aria-invalid')

      await user.click(screen.getByText('submit'))
      expect(button).toHaveAttribute('aria-invalid', 'true')
      expect(screen.queryByTestId('error')).not.toBe(null)

      fireEvent.click(button)
      await nextTick()
      expect(button).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBe(null)

      fireEvent.click(button)
      await nextTick()
      expect(button).toHaveAttribute('aria-invalid', 'true')
      expect(screen.queryByTestId('error')).not.toBe(null)
    })

    it('prop: validationMode=onChange', async () => {
      render(createSwitchApp({
        setup() {
          function validate(value: unknown) {
            const checked = value as boolean
            return checked ? 'error' : null
          }

          return { validate }
        },
        template: `
          <FieldRoot validation-mode="onChange" :validate="validate">
            <SwitchRoot data-testid="button" />
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
      const user = userEvent.setup()

      render(createSwitchApp({
        setup() {
          const checked = ref(false)
          return { checked, validateSpy }
        },
        template: `
          <div>
            <FieldRoot name="newsletters" validation-mode="onChange" :validate="validateSpy">
              <SwitchRoot data-testid="button" :checked="checked" @checked-change="(value) => checked = value" />
            </FieldRoot>
            <button type="button" @click="checked = !checked">Toggle externally</button>
          </div>
        `,
      }))

      const button = screen.getByTestId('button')
      const toggle = screen.getByText('Toggle externally')

      expect(button).not.toHaveAttribute('aria-invalid')
      const initialCallCount = validateSpy.mock.calls.length

      await user.click(toggle)

      expect(validateSpy.mock.calls.length).toBe(initialCallCount + 1)
      expect(validateSpy.mock.lastCall?.[0]).toBe(true)
      expect(button).toHaveAttribute('aria-invalid', 'true')
    })

    it('prop: validationMode=onBlur', async () => {
      render(createSwitchApp({
        setup() {
          function validate(value: unknown) {
            const checked = value as boolean
            return checked ? 'error' : null
          }

          return { validate }
        },
        template: `
          <FieldRoot validation-mode="onBlur" :validate="validate">
            <SwitchRoot data-testid="button" />
            <FieldError data-testid="error" />
          </FieldRoot>
        `,
      }))

      const button = screen.getByTestId('button')

      expect(button).not.toHaveAttribute('aria-invalid')

      fireEvent.click(button)
      fireEvent.blur(button)
      await nextTick()

      expect(button).toHaveAttribute('aria-invalid', 'true')
    })

    describe('fieldLabel', () => {
      describe('implicit', () => {
        it('sets `for` on the label', async () => {
          render(createSwitchApp({
            template: `
              <FieldRoot>
                <FieldLabel data-testid="label">
                  <SwitchRoot />
                  OK
                </FieldLabel>
              </FieldRoot>
            `,
          }))
          await nextTick()

          const label = screen.getByTestId('label')
          expect(label.getAttribute('for')).not.toBe(null)

          const input = document.querySelector('input[type="checkbox"]')
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))

          const switchElement = screen.getByRole('switch')
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
          expect(switchElement).toHaveAttribute('aria-checked', 'false')

          fireEvent.click(label)
          await nextTick()
          expect(switchElement).toHaveAttribute('aria-checked', 'true')
        })
      })

      describe('explicit association', () => {
        it('when the label is sibling to the switch', async () => {
          render(createSwitchApp({
            template: `
              <FieldRoot>
                <FieldLabel data-testid="label">Label</FieldLabel>
                <SwitchRoot />
              </FieldRoot>
            `,
          }))
          await nextTick()

          const label = screen.getByTestId('label')
          const switchElement = screen.getByRole('switch')
          const input = document.querySelector('input[type="checkbox"]')

          expect(label.getAttribute('for')).not.toBe(null)
          expect(label.getAttribute('for')).toBe(input?.getAttribute('id'))
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))

          expect(switchElement).toHaveAttribute('aria-checked', 'false')
          fireEvent.click(label)
          await nextTick()
          expect(switchElement).toHaveAttribute('aria-checked', 'true')
        })

        it('when rendering a non-native button', async () => {
          render(createSwitchApp({
            template: `
              <FieldRoot>
                <FieldLabel data-testid="label">OK</FieldLabel>
                <SwitchRoot as="span" :native-button="false" />
              </FieldRoot>
            `,
          }))
          await nextTick()

          const label = screen.getByTestId('label')
          expect(label.getAttribute('for')).not.toBe(null)

          const input = document.querySelector('input[type="checkbox"]')
          expect(input?.getAttribute('id')).toBe(label.getAttribute('for'))

          const switchElement = screen.getByRole('switch')
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
        })

        it('when rendering a non-native label', () => {
          render(createSwitchApp({
            template: `
              <FieldRoot>
                <FieldLabel data-testid="label" as="span">
                  <SwitchRoot data-testid="button" />
                </FieldLabel>
              </FieldRoot>
            `,
          }))

          const label = screen.getByTestId('label')
          const switchElement = screen.getByRole('switch')

          expect(label.getAttribute('for')).toBe(null)
          expect(label.getAttribute('id')).not.toBe(null)
          expect(switchElement.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))

          fireEvent.click(label)
          expect(switchElement).not.toHaveAttribute('aria-checked', 'true')
        })
      })
    })

    it('fieldDescription', async () => {
      render(createSwitchApp({
        template: `
          <FieldRoot>
            <SwitchRoot data-testid="button" />
            <FieldDescription data-testid="description" />
          </FieldRoot>
        `,
      }))
      await nextTick()

      const internalInput = screen.getByRole('checkbox', { hidden: true })
      expect(internalInput).toHaveAttribute(
        'aria-describedby',
        screen.getByTestId('description').id,
      )
    })
  })

  it('can render a native button', async () => {
    const user = userEvent.setup()

    render(createSwitchApp({
      template: `<SwitchRoot as="button" :native-button="true" />`,
    }))

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')
    expect(switchElement.tagName).toBe('BUTTON')

    await user.tab()
    expect(switchElement).toHaveFocus()

    await user.keyboard('[Enter]')
    expect(switchElement).toHaveAttribute('aria-checked', 'true')

    await user.keyboard('[Space]')
    expect(switchElement).toHaveAttribute('aria-checked', 'false')

    await user.click(switchElement)
    expect(switchElement).toHaveAttribute('aria-checked', 'true')
  })
})
