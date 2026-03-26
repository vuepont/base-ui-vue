import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import CheckboxIndicator from '../checkbox/indicator/CheckboxIndicator.vue'
import CheckboxRoot from '../checkbox/root/CheckboxRoot.vue'
import FieldDescription from '../field/description/FieldDescription.vue'
import FieldError from '../field/error/FieldError.vue'
import FieldItem from '../field/item/FieldItem.vue'
import FieldLabel from '../field/label/FieldLabel.vue'
import FieldRoot from '../field/root/FieldRoot.vue'
import Form from '../form/Form.vue'
import CheckboxGroup from './CheckboxGroup.vue'

function createGroupApp(options: {
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
      FieldItem,
      FieldLabel,
      FieldRoot,
      Form,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<CheckboxGroup />', () => {
  describe('prop: value', () => {
    it('should control the value', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()

      render(createGroupApp({
        setup() {
          const value = ref<string[]>([])

          function onValueChange(nextValue: string[]) {
            value.value = nextValue
            handleValueChange(nextValue)
          }

          return { value, onValueChange }
        },
        template: `
        <CheckboxGroup :value="value" @value-change="onValueChange">
          <CheckboxRoot value="red" data-testid="red" />
          <CheckboxRoot value="green" data-testid="green" />
          <CheckboxRoot value="blue" data-testid="blue" />
        </CheckboxGroup>
      `,
      }))

      await user.click(screen.getByTestId('red'))
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['red'])

      render(createGroupApp({
        template: `
        <CheckboxGroup :default-value="['red']">
          <CheckboxRoot value="red" data-testid="default-red" />
          <CheckboxRoot value="green" data-testid="default-green" />
        </CheckboxGroup>
      `,
      }))

      expect(screen.getByTestId('default-red')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('default-green')).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('emit: ValueChange', () => {
    it('should be called when the value changes', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()

      render(createGroupApp({
        setup() {
          const value = ref<string[]>([])

          function onValueChange(nextValue: string[]) {
            value.value = nextValue
            handleValueChange(nextValue)
          }

          return { value, onValueChange }
        },
        template: `
          <CheckboxGroup :value="value" @value-change="onValueChange">
            <CheckboxRoot value="red" data-testid="red" />
            <CheckboxRoot value="green" data-testid="green" />
            <CheckboxRoot value="blue" data-testid="blue" />
          </CheckboxGroup>
        `,
      }))

      await user.click(screen.getByTestId('red'))
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(['red'])
    })
  })

  describe('prop: defaultValue', () => {
    it('should set the initial value', () => {
      render(createGroupApp({
        template: `
          <CheckboxGroup :default-value="['red']">
            <CheckboxRoot value="red" data-testid="red" />
            <CheckboxRoot value="green" data-testid="green" />
            <CheckboxRoot value="blue" data-testid="blue" />
          </CheckboxGroup>
        `,
      }))

      expect(screen.getByTestId('red')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-checked', 'false')
      expect(screen.getByTestId('blue')).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: disabled', () => {
    it('disables all checkboxes when `true`', () => {
      render(createGroupApp({
        template: `
        <CheckboxGroup disabled>
          <CheckboxRoot value="red" data-testid="red" />
          <CheckboxRoot value="green" data-testid="green" />
        </CheckboxGroup>
      `,
      }))

      expect(screen.getByTestId('red')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not disable all checkboxes when `false`', () => {
      render(createGroupApp({
        template: `
        <CheckboxGroup :disabled="false">
          <CheckboxRoot value="red" data-testid="red" />
          <CheckboxRoot value="green" data-testid="green" />
        </CheckboxGroup>
      `,
      }))

      expect(screen.getByTestId('red')).not.toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('green')).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('takes precedence over individual checkboxes', () => {
      render(createGroupApp({
        template: `
        <CheckboxGroup disabled>
          <CheckboxRoot value="red" :disabled="false" data-testid="red" />
          <CheckboxRoot value="green" data-testid="green" />
        </CheckboxGroup>
      `,
      }))

      expect(screen.getByTestId('red')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByTestId('green')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  it('supports a parent checkbox controlling child checkboxes', async () => {
    const user = userEvent.setup()

    render(createGroupApp({
      setup() {
        const allValues = ['a', 'b', 'c']
        const value = ref<string[]>([])

        function onValueChange(nextValue: string[]) {
          value.value = nextValue
        }

        return { allValues, value, onValueChange }
      },
      template: `
        <CheckboxGroup
          :all-values="allValues"
          :value="value"
          @value-change="onValueChange"
        >
          <CheckboxRoot parent data-testid="parent">
            <CheckboxIndicator />
          </CheckboxRoot>
          <CheckboxRoot value="a" data-testid="a" />
          <CheckboxRoot value="b" data-testid="b" />
          <CheckboxRoot value="c" data-testid="c" />
        </CheckboxGroup>
      `,
    }))

    await user.click(screen.getByTestId('parent'))

    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('b')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('c')).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByTestId('a'))
    expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('does not remain dirty when the selected values return to the initial set in a different order', async () => {
    const user = userEvent.setup()

    render(createGroupApp({
      template: `
        <FieldRoot name="letters">
          <CheckboxGroup :default-value="['a', 'b']">
            <CheckboxRoot value="a" data-testid="a" />
            <CheckboxRoot value="b" data-testid="b" />
          </CheckboxGroup>
        </FieldRoot>
      `,
    }))

    const group = screen.getByRole('group')

    expect(group).not.toHaveAttribute('data-dirty')

    await user.click(screen.getByTestId('a'))
    expect(group).toHaveAttribute('data-dirty')

    await user.click(screen.getByTestId('a'))
    expect(group).not.toHaveAttribute('data-dirty')
  })

  describe('fieldLabel', () => {
    it('implicit association', async () => {
      const user = userEvent.setup()
      const handleCheckedChange = vi.fn()

      render(createGroupApp({
        setup() {
          return { handleCheckedChange }
        },
        template: `
        <FieldRoot name="apple">
          <CheckboxGroup :default-value="['fuji-apple']">
            <FieldItem>
              <FieldLabel data-testid="implicit-label">
                <CheckboxRoot value="fuji-apple" />
                Fuji
              </FieldLabel>
            </FieldItem>
            <FieldItem>
              <CheckboxRoot value="gala-apple" @checked-change="handleCheckedChange" />
              <FieldLabel data-testid="explicit-label">Gala</FieldLabel>
              <FieldDescription data-testid="description">Description</FieldDescription>
            </FieldItem>
          </CheckboxGroup>
        </FieldRoot>
      `,
      }))

      await user.click(screen.getByTestId('implicit-label'))
      await nextTick()

      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toHaveAttribute('aria-checked', 'false')

      await user.click(screen.getByTestId('explicit-label'))
      await nextTick()

      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
      expect(checkboxes[1].getAttribute('aria-describedby')).toContain(
        screen.getByTestId('description').getAttribute('id'),
      )
    })

    it('explicit association', async () => {
      const user = userEvent.setup()
      const handleCheckedChange = vi.fn()

      render(createGroupApp({
        setup() {
          return { handleCheckedChange }
        },
        template: `
          <FieldRoot name="apple">
            <CheckboxGroup :default-value="['fuji-apple', 'gala-apple']">
              <FieldItem>
                <CheckboxRoot value="fuji-apple" />
                <FieldLabel data-testid="label">Fuji</FieldLabel>
                <FieldDescription data-testid="description">
                  A fuji apple is the round, edible fruit of an apple tree
                </FieldDescription>
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="gala-apple" @checked-change="handleCheckedChange" />
                <FieldLabel data-testid="label">Gala</FieldLabel>
                <FieldDescription data-testid="description">
                  A gala apple is the round, edible fruit of an apple tree
                </FieldDescription>
              </FieldItem>
            </CheckboxGroup>
          </FieldRoot>
        `,
      }))

      await user.click(screen.getByText('Gala'))
      expect(handleCheckedChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('fieldDescription', () => {
    it('links the group and individual checkboxes', async () => {
      render(createGroupApp({
        template: `
        <FieldRoot name="apple">
          <CheckboxGroup :default-value="[]">
            <FieldDescription data-testid="group-description">Group description</FieldDescription>
            <FieldItem>
              <FieldLabel>
                <CheckboxRoot value="fuji-apple" />
                Fuji
              </FieldLabel>
            </FieldItem>
          </CheckboxGroup>
        </FieldRoot>
      `,
      }))

      await nextTick()
      const descriptionId = screen.getByTestId('group-description').getAttribute('id')
      expect(screen.getByRole('group').getAttribute('aria-describedby')).toContain(descriptionId)
      expect(screen.getByRole('checkbox').getAttribute('aria-describedby')).toContain(descriptionId)
    })
  })

  describe('field', () => {
    it('prop: validationMode=onSubmit', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn((value: unknown) => {
        const values = value as string[]
        return values.length === 0 ? 'error' : null
      })

      render(createGroupApp({
        setup() {
          return { validateSpy }
        },
        template: `
        <Form>
          <FieldRoot name="group" :validate="validateSpy">
            <CheckboxGroup :default-value="[]">
              <FieldItem>
                <CheckboxRoot value="one" data-testid="one" />
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="two" data-testid="two" />
              </FieldItem>
            </CheckboxGroup>
            <FieldError data-testid="error" />
          </FieldRoot>
          <button type="submit">Submit</button>
        </Form>
      `,
      }))

      await user.click(screen.getByText('Submit'))
      await nextTick()

      expect(validateSpy).toHaveBeenCalled()
      expect(screen.getByTestId('error').textContent).toContain('error')
    })

    it('prop: validationMode=onChange', async () => {
      const validateSpy = vi.fn((value: unknown) => {
        const values = value as string[]
        return values.includes('one') ? 'error' : null
      })

      render(createGroupApp({
        setup() {
          return { validateSpy }
        },
        template: `
        <FieldRoot validation-mode="onChange" :validate="validateSpy" name="apple">
          <CheckboxGroup :default-value="['one']">
            <FieldItem>
              <CheckboxRoot value="one" data-testid="checkbox" />
            </FieldItem>
            <FieldItem>
              <CheckboxRoot value="two" data-testid="checkbox" />
            </FieldItem>
            <FieldItem>
              <CheckboxRoot value="three" data-testid="checkbox" />
            </FieldItem>
          </CheckboxGroup>
        </FieldRoot>
      `,
      }))

      const checkboxes = screen.getAllByTestId('checkbox')

      checkboxes.forEach(checkbox => expect(checkbox).not.toHaveAttribute('aria-invalid'))

      fireEvent.click(checkboxes[0])
      await nextTick()
      expect(validateSpy.mock.lastCall?.[0]).toEqual([])
      checkboxes.forEach(checkbox => expect(checkbox).not.toHaveAttribute('aria-invalid'))

      fireEvent.click(checkboxes[1])
      await nextTick()
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['two'])
      checkboxes.forEach(checkbox => expect(checkbox).not.toHaveAttribute('aria-invalid'))

      fireEvent.click(checkboxes[0])
      await nextTick()
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['two', 'one'])
      checkboxes.forEach(checkbox => expect(checkbox).toHaveAttribute('aria-invalid', 'true'))
    })

    it('revalidates when the controlled value changes externally', async () => {
      const user = userEvent.setup()
      const validateSpy = vi.fn((value: unknown) => {
        const values = value as string[]
        return values.includes('one') ? 'error' : null
      })

      render(createGroupApp({
        setup() {
          const selected = ref<string[]>([])
          return { selected, validateSpy }
        },
        template: `
        <div>
          <FieldRoot validation-mode="onChange" :validate="validateSpy" name="apple">
            <CheckboxGroup :value="selected">
              <FieldItem>
                <CheckboxRoot value="one" data-testid="checkbox" />
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="two" data-testid="checkbox" />
              </FieldItem>
            </CheckboxGroup>
          </FieldRoot>
          <button type="button" @click="selected = ['one']">Select externally</button>
        </div>
      `,
      }))

      const checkboxes = screen.getAllByTestId('checkbox')
      checkboxes.forEach(checkbox => expect(checkbox).not.toHaveAttribute('aria-invalid'))

      await user.click(screen.getByText('Select externally'))
      await nextTick()

      expect(validateSpy.mock.lastCall?.[0]).toEqual(['one'])
      checkboxes.forEach(checkbox => expect(checkbox).toHaveAttribute('aria-invalid', 'true'))
    })

    it('prop: validationMode=onBlur', async () => {
      const validateSpy = vi.fn((value: unknown) => {
        const values = value as string[]
        return values.includes('one') ? 'error' : null
      })

      render(createGroupApp({
        setup() {
          return { validateSpy }
        },
        template: `
        <FieldRoot validation-mode="onBlur" :validate="validateSpy" name="apple">
          <CheckboxGroup :default-value="['one']">
            <FieldItem>
              <CheckboxRoot value="one" data-testid="checkbox" />
            </FieldItem>
            <FieldItem>
              <CheckboxRoot value="two" data-testid="checkbox" />
            </FieldItem>
            <FieldItem>
              <CheckboxRoot value="three" data-testid="checkbox" />
            </FieldItem>
          </CheckboxGroup>
          <FieldError data-testid="error" />
        </FieldRoot>
      `,
      }))

      const checkboxes = screen.getAllByTestId('checkbox')

      fireEvent.click(checkboxes[0])
      expect(validateSpy).toHaveBeenCalledTimes(0)
      fireEvent.blur(checkboxes[0])
      await nextTick()
      expect(validateSpy.mock.lastCall?.[0]).toEqual([])

      fireEvent.click(checkboxes[2])
      fireEvent.blur(checkboxes[2])
      await nextTick()
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['three'])

      fireEvent.click(checkboxes[0])
      fireEvent.blur(checkboxes[0])
      await nextTick()
      expect(validateSpy.mock.lastCall?.[0]).toEqual(['three', 'one'])
      await waitFor(() => {
        checkboxes.forEach(checkbox => expect(checkbox).toHaveAttribute('aria-invalid', 'true'))
      })
    })
  })

  describe('form', () => {
    it('focuses the first checkbox when the field receives an error from Form', async () => {
      const user = userEvent.setup()

      const App = createGroupApp({
        setup() {
          const errors = ref<Record<string, string>>({})

          function handleFormSubmit() {
            errors.value = { group: 'server error' }
          }

          return { errors, handleFormSubmit }
        },
        template: `
        <Form :errors="errors" @form-submit="handleFormSubmit">
          <FieldRoot name="group">
            <CheckboxGroup :default-value="['one']">
              <FieldItem>
                <CheckboxRoot value="one" data-testid="one" />
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="two" data-testid="two" />
              </FieldItem>
            </CheckboxGroup>
            <FieldError data-testid="error" />
          </FieldRoot>
          <button type="submit">Submit</button>
        </Form>
      `,
      })

      render(App)

      await user.click(screen.getByText('Submit'))
      await nextTick()
      await nextTick()

      expect(screen.getByTestId('one')).toHaveFocus()
      expect(screen.getByTestId('error').textContent).toContain('server error')
    })

    it('appends the id attribute of the error to aria-describedby of individual checkboxes', async () => {
      render(createGroupApp({
        setup() {
          return {
            errors: { group: 'error' },
          }
        },
        template: `
        <Form :errors="errors">
          <FieldRoot name="group">
            <CheckboxGroup :default-value="['one']">
              <FieldItem>
                <CheckboxRoot value="one" />
                <FieldDescription data-testid="description">Description</FieldDescription>
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="two" />
              </FieldItem>
            </CheckboxGroup>
            <FieldError data-testid="error" />
          </FieldRoot>
          <button type="submit">Submit</button>
        </Form>
      `,
      }))

      await nextTick()
      const errorId = screen.getByTestId('error').getAttribute('id')
      const descriptionId = screen.getByTestId('description').getAttribute('id')
      const [checkbox1] = screen.getAllByRole('checkbox')

      expect(checkbox1.getAttribute('aria-describedby')).toContain(errorId)
      expect(checkbox1.getAttribute('aria-describedby')).toContain(descriptionId)
    })

    it('excludes parent checkboxes from form submission', async () => {
      const user = userEvent.setup()
      const submitSpy = vi.fn()

      render(createGroupApp({
        setup() {
          const allValues = ['fuji-apple', 'gala-apple', 'granny-smith-apple']
          const value = ref<string[]>(['fuji-apple', 'gala-apple'])

          function onValueChange(nextValue: string[]) {
            value.value = nextValue
          }

          return { allValues, value, onValueChange, submitSpy }
        },
        template: `
        <Form @form-submit="submitSpy">
          <FieldRoot name="apple">
            <CheckboxGroup
              :all-values="allValues"
              :value="value"
              @value-change="onValueChange"
            >
              <FieldItem>
                <CheckboxRoot parent data-testid="parent" />
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="fuji-apple" />
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="gala-apple" />
              </FieldItem>
              <FieldItem>
                <CheckboxRoot value="granny-smith-apple" data-testid="third" />
              </FieldItem>
            </CheckboxGroup>
          </FieldRoot>
          <button type="submit">Submit</button>
        </Form>
      `,
      }))

      await user.click(screen.getByTestId('third'))
      await user.click(screen.getByText('Submit'))
      await nextTick()

      expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'true')
      expect(submitSpy).toHaveBeenCalledTimes(1)
      expect(submitSpy.mock.calls[0][0]).toEqual({
        apple: ['fuji-apple', 'gala-apple', 'granny-smith-apple'],
      })
    })
  })
})
