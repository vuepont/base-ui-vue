import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, onMounted, ref } from 'vue'
import { RadioGroup } from '.'
import { FieldDescription, FieldItem, FieldLabel, FieldRoot } from '../field'
import { FieldsetLegend, FieldsetRoot } from '../fieldset'
import { RadioIndicator, RadioRoot } from '../radio'
import { Slot } from '../utils/slot'

function createRadioGroupApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      FieldDescription,
      FieldItem,
      FieldLabel,
      FieldRoot,
      FieldsetLegend,
      FieldsetRoot,
      RadioGroup,
      RadioIndicator,
      RadioRoot,
    },
    setup: options.setup,
    template: options.template,
  })
}

function getRadioInput(radio: HTMLElement) {
  return radio.nextElementSibling as HTMLInputElement
}

describe('<RadioGroup />', () => {
  describe('extra props', () => {
    it('can override the built-in attributes', () => {
      render(createRadioGroupApp({
        template: `<RadioGroup role="switch" />`,
      }))

      expect(screen.getByRole('switch')).toHaveAttribute('role', 'switch')
    })
  })

  describe('prop: id', () => {
    it('is forwarded to the root element', () => {
      render(createRadioGroupApp({
        template: `<RadioGroup id="group-id" />`,
      }))

      expect(screen.getByRole('radiogroup')).toHaveAttribute('id', 'group-id')
    })
  })

  describe('prop: onValueChange', () => {
    it('should call onValueChange when an item is clicked', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(createRadioGroupApp({
        setup() {
          return { handleChange }
        },
        template: `
          <RadioGroup @value-change="handleChange">
            <RadioRoot value="a" data-testid="item" />
          </RadioGroup>
        `,
      }))

      await user.click(screen.getByTestId('item'))

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe('a')
    })

    it('should report keyboard modifier event properties when calling onCheckedChange', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(createRadioGroupApp({
        setup() {
          return { handleChange }
        },
        template: `
          <RadioGroup @value-change="handleChange">
            <RadioRoot value="a" data-testid="item" />
          </RadioGroup>
        `,
      }))

      await user.keyboard('{Shift>}')
      await user.click(screen.getByTestId('item'))
      await user.keyboard('{/Shift}')

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][1].event.shiftKey).toBe(true)
    })

    it('should select an item with Space on keyup', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      render(createRadioGroupApp({
        setup() {
          return { handleChange }
        },
        template: `
          <RadioGroup @value-change="handleChange">
            <RadioRoot value="a" data-testid="item" />
          </RadioGroup>
        `,
      }))

      const item = screen.getByTestId('item')
      item.focus()

      await user.keyboard('[Space>]')

      expect(handleChange).not.toHaveBeenCalled()

      await user.keyboard('[/Space]')

      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenLastCalledWith('a', expect.anything())
    })

    it('does not change state when canceled via a root click', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn((_value, eventDetails: { cancel: () => void }) => {
        eventDetails.cancel()
      })

      render(createRadioGroupApp({
        setup() {
          return { handleChange }
        },
        template: `
          <FieldRoot>
            <RadioGroup @value-change="handleChange">
              <RadioRoot value="a" data-testid="item" />
            </RadioGroup>
          </FieldRoot>
        `,
      }))

      const group = screen.getByRole('radiogroup')
      const item = screen.getByTestId('item')
      const input = document.querySelector<HTMLInputElement>('input[type="radio"]')

      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(input?.checked).toBe(false)
      expect(group).not.toHaveAttribute('data-touched')
      expect(group).not.toHaveAttribute('data-dirty')
      expect(group).not.toHaveAttribute('data-filled')
    })

    it('does not change state when canceled via a hidden input click', async () => {
      const handleChange = vi.fn((_value, eventDetails: { cancel: () => void }) => {
        eventDetails.cancel()
      })

      render(createRadioGroupApp({
        setup() {
          return { handleChange }
        },
        template: `
          <FieldRoot>
            <RadioGroup @value-change="handleChange">
              <RadioRoot value="a" data-testid="item" />
            </RadioGroup>
          </FieldRoot>
        `,
      }))

      const group = screen.getByRole('radiogroup')
      const item = screen.getByTestId('item')
      const input = document.querySelector<HTMLInputElement>('input[type="radio"]')

      expect(input).not.toBeNull()

      await fireEvent.click(input as HTMLInputElement)

      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(input?.checked).toBe(false)
      expect(group).not.toHaveAttribute('data-touched')
      expect(group).not.toHaveAttribute('data-dirty')
      expect(group).not.toHaveAttribute('data-filled')
    })

    it('does not change state when canceled via arrow key navigation', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn((_value, eventDetails: { cancel: () => void }) => {
        eventDetails.cancel()
      })

      render(createRadioGroupApp({
        setup() {
          return { handleChange }
        },
        template: `
          <FieldRoot>
            <RadioGroup @value-change="handleChange">
              <RadioRoot value="a" data-testid="a" />
              <RadioRoot value="b" data-testid="b" />
            </RadioGroup>
          </FieldRoot>
        `,
      }))

      const group = screen.getByRole('radiogroup')
      const a = screen.getByTestId('a')
      const b = screen.getByTestId('b')
      const inputs = document.querySelectorAll<HTMLInputElement>('input[type="radio"]')

      a.focus()

      await user.keyboard('[ArrowDown]')

      expect(b).toHaveFocus()
      expect(a).toHaveAttribute('aria-checked', 'false')
      expect(b).toHaveAttribute('aria-checked', 'false')
      expect(inputs[0]?.checked).toBe(false)
      expect(inputs[1]?.checked).toBe(false)
      expect(group).not.toHaveAttribute('data-touched')
      expect(group).not.toHaveAttribute('data-dirty')
      expect(group).not.toHaveAttribute('data-filled')
    })
  })

  describe('prop: disabled', () => {
    it('should have the `aria-disabled` attribute', () => {
      render(createRadioGroupApp({
        template: `
          <RadioGroup disabled>
            <RadioRoot value="a" />
          </RadioGroup>
        `,
      }))

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByRole('radio')).toHaveAttribute('aria-disabled', 'true')
      expect(screen.getByRole('radio')).toHaveAttribute('data-disabled')
      expect(document.querySelector('input[type="radio"]')).toHaveAttribute('disabled')
    })

    it('should not have the aria attribute when `disabled` is not set', () => {
      render(createRadioGroupApp({
        template: `<RadioGroup />`,
      }))

      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-disabled')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createRadioGroupApp({
        template: `
          <RadioGroup disabled>
            <RadioRoot value="" data-testid="item" />
          </RadioGroup>
        `,
      }))

      const item = screen.getByTestId('item')

      expect(item).toHaveAttribute('aria-checked', 'false')

      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('prop: readOnly', () => {
    it('should have the `aria-readonly` attribute', () => {
      render(createRadioGroupApp({
        template: `<RadioGroup read-only />`,
      }))

      expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-readonly', 'true')
    })

    it('should not have the aria attribute when `readOnly` is not set', () => {
      render(createRadioGroupApp({
        template: `<RadioGroup />`,
      }))

      expect(screen.getByRole('radiogroup')).not.toHaveAttribute('aria-readonly')
    })

    it('should not change its state when clicked', async () => {
      const user = userEvent.setup()

      render(createRadioGroupApp({
        template: `
          <RadioGroup read-only>
            <RadioRoot value="" data-testid="item" />
          </RadioGroup>
        `,
      }))

      const item = screen.getByTestId('item')

      expect(item).toHaveAttribute('aria-checked', 'false')

      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'false')
    })
  })

  it('should update its state if the underlying input is toggled', async () => {
    render(createRadioGroupApp({
      template: `
        <RadioGroup data-testid="root">
          <RadioRoot value="" data-testid="item" />
        </RadioGroup>
      `,
    }))

    const group = screen.getByTestId('root')
    const item = screen.getByTestId('item')
    const input = group.querySelector<HTMLInputElement>('input')

    expect(input).not.toBeNull()

    await fireEvent.click(input as HTMLInputElement)

    expect(item).toHaveAttribute('aria-checked', 'true')
  })

  it('should place the style hooks on the root and subcomponents', () => {
    render(createRadioGroupApp({
      template: `
        <RadioGroup default-value="1" disabled read-only required>
          <RadioRoot value="1" data-testid="item">
            <RadioIndicator data-testid="indicator" />
          </RadioRoot>
        </RadioGroup>
      `,
    }))

    const root = screen.getByRole('radiogroup')
    const item = screen.getByTestId('item')
    const indicator = screen.getByTestId('indicator')

    expect(root).toHaveAttribute('data-disabled', '')
    expect(root).toHaveAttribute('data-readonly', '')
    expect(root).toHaveAttribute('data-required', '')

    expect(item).toHaveAttribute('data-checked', '')
    expect(item).toHaveAttribute('data-disabled', '')
    expect(item).toHaveAttribute('data-readonly', '')
    expect(item).toHaveAttribute('data-required', '')

    expect(indicator).toHaveAttribute('data-checked', '')
    expect(indicator).toHaveAttribute('data-disabled', '')
    expect(indicator).toHaveAttribute('data-readonly', '')
    expect(indicator).toHaveAttribute('data-required', '')
  })

  it('should set the name attribute on each radio input', () => {
    render(createRadioGroupApp({
      template: `
        <RadioGroup name="radio-group">
          <RadioRoot value="a" data-testid="radio" />
        </RadioGroup>
      `,
    }))

    const input = getRadioInput(screen.getByTestId('radio'))

    expect(input).toHaveAttribute('name', 'radio-group')
    expect(input).toHaveAttribute('value', 'a')
  })

  it('points inputRef to the checked radio input when present', async () => {
    const groupInputRef = ref<HTMLInputElement | null>(null)

    render(defineComponent({
      setup() {
        return () => h(RadioGroup, { defaultValue: 'a', inputRef: groupInputRef }, {
          default: () => [
            h(RadioRoot, { 'value': 'a', 'data-testid': 'radio-a' }),
            h(RadioRoot, { 'value': 'b', 'data-testid': 'radio-b' }),
          ],
        })
      },
    }))

    const radioA = screen.getByTestId('radio-a')
    const radioB = screen.getByTestId('radio-b')
    const inputA = getRadioInput(radioA)
    const inputB = getRadioInput(radioB)

    expect(groupInputRef.value).toBe(inputA)

    await fireEvent.click(radioB)

    expect(groupInputRef.value).toBe(inputB)
  })

  it('allows reading inputRef.current in an effect', async () => {
    let observedValue: string | null = null

    render(defineComponent({
      setup() {
        const inputRef = ref<HTMLInputElement | null>(null)

        onMounted(() => {
          observedValue = inputRef.value?.value ?? null
        })

        return () => h(RadioGroup, { defaultValue: 'a', inputRef }, {
          default: () => [
            h(RadioRoot, { value: 'a' }),
            h(RadioRoot, { value: 'b' }),
          ],
        })
      },
    }))

    await nextTick()

    expect(observedValue).toBe('a')
  })

  it('supports inputRef as a function', async () => {
    const inputRefSpy = vi.fn()

    render(createRadioGroupApp({
      setup() {
        return { inputRefSpy }
      },
      template: `
        <RadioGroup default-value="a" :input-ref="inputRefSpy">
          <RadioRoot value="a" data-testid="radio-a" />
          <RadioRoot value="b" data-testid="radio-b" />
        </RadioGroup>
      `,
    }))

    const radioA = screen.getByTestId('radio-a')
    const radioB = screen.getByTestId('radio-b')
    const inputA = getRadioInput(radioA)
    const inputB = getRadioInput(radioB)

    await fireEvent.click(radioB)

    expect(inputRefSpy.mock.calls.some(args => args[0] === inputA)).toBe(true)
    expect(inputRefSpy.mock.calls.some(args => args[0] === inputB)).toBe(true)
    expect(inputRefSpy.mock.lastCall?.[0]).toBe(inputB)
  })

  it('skips disabled radios when assigning inputRef', () => {
    const groupInputRef = ref<HTMLInputElement | null>(null)

    render(defineComponent({
      setup() {
        return () => h(RadioGroup, { inputRef: groupInputRef }, {
          default: () => [
            h(RadioRoot, { 'value': 'a', 'disabled': true, 'data-testid': 'radio-a' }),
            h(RadioRoot, { 'value': 'b', 'data-testid': 'radio-b' }),
          ],
        })
      },
    }))

    const inputB = getRadioInput(screen.getByTestId('radio-b'))

    expect(groupInputRef.value).toBe(inputB)
  })

  it('keeps inputRef pointing to the first radio when the value is cleared', async () => {
    const groupInputRef = ref<HTMLInputElement | null>(null)

    render(defineComponent({
      setup() {
        const value = ref<string | null>('a')

        return () => h('div', [
          h(RadioGroup, { value: value.value, inputRef: groupInputRef }, {
            default: () => [
              h(RadioRoot, { 'value': 'a', 'data-testid': 'radio-a' }),
              h(RadioRoot, { 'value': 'b', 'data-testid': 'radio-b' }),
            ],
          }),
          h('button', {
            type: 'button',
            onClick: () => {
              value.value = null
            },
          }, 'Clear'),
        ])
      },
    }))

    const inputA = getRadioInput(screen.getByTestId('radio-a'))

    expect(groupInputRef.value).toBe(inputA)

    await fireEvent.click(screen.getByText('Clear'))
    await nextTick()

    expect(groupInputRef.value).toBe(inputA)
  })

  it('should automatically select radio upon navigation', async () => {
    const user = userEvent.setup()

    render(createRadioGroupApp({
      template: `
        <FieldRoot>
          <RadioGroup>
            <RadioRoot value="a" data-testid="a" />
            <RadioRoot value="b" data-testid="b" />
          </RadioGroup>
        </FieldRoot>
      `,
    }))

    const group = screen.getByRole('radiogroup')
    const a = screen.getByTestId('a')
    const b = screen.getByTestId('b')

    a.focus()

    expect(group).not.toHaveAttribute('data-touched')
    expect(a).toHaveAttribute('aria-checked', 'false')

    await user.keyboard('[ArrowDown]')

    expect(a).toHaveAttribute('aria-checked', 'false')
    expect(b).toHaveFocus()
    expect(b).toHaveAttribute('aria-checked', 'true')
    expect(group).toHaveAttribute('data-touched', '')
  })

  describe('style hooks', () => {
    it('should apply data-checked and data-unchecked to radio root and indicator', async () => {
      render(createRadioGroupApp({
        template: `
          <RadioGroup>
            <RadioRoot value="a" data-testid="a">
              <RadioIndicator keep-mounted data-testid="indicator-a" />
            </RadioRoot>
            <RadioRoot value="b" data-testid="b">
              <RadioIndicator keep-mounted data-testid="indicator-b" />
            </RadioRoot>
          </RadioGroup>
        `,
      }))

      const a = screen.getByTestId('a')
      const b = screen.getByTestId('b')
      const indicatorA = screen.getByTestId('indicator-a')
      const indicatorB = screen.getByTestId('indicator-b')

      expect(a).toHaveAttribute('data-unchecked', '')
      expect(indicatorA).toHaveAttribute('data-unchecked', '')

      expect(b).toHaveAttribute('data-unchecked', '')
      expect(indicatorB).toHaveAttribute('data-unchecked', '')

      await fireEvent.click(a)

      expect(a).toHaveAttribute('data-checked', '')
      expect(indicatorA).toHaveAttribute('data-checked', '')

      expect(b).toHaveAttribute('data-unchecked', '')
      expect(indicatorB).toHaveAttribute('data-unchecked', '')

      await fireEvent.click(b)

      expect(a).toHaveAttribute('data-unchecked', '')
      expect(indicatorA).toHaveAttribute('data-unchecked', '')

      expect(b).toHaveAttribute('data-checked', '')
      expect(indicatorB).toHaveAttribute('data-checked', '')

      await fireEvent.click(a)

      expect(a).toHaveAttribute('data-checked', '')
      expect(indicatorA).toHaveAttribute('data-checked', '')

      expect(b).toHaveAttribute('data-unchecked', '')
      expect(indicatorB).toHaveAttribute('data-unchecked', '')
    })
  })

  it('does not forward `value` prop', () => {
    render(createRadioGroupApp({
      template: `
        <RadioGroup value="test" data-testid="radio-group">
          <RadioRoot value="" />
        </RadioGroup>
      `,
    }))

    expect(screen.getByTestId('radio-group')).not.toHaveAttribute('value')
  })

  it('sets tabIndex=0 to the correct element initially', async () => {
    render(createRadioGroupApp({
      template: `
        <RadioGroup default-value="b">
          <RadioRoot value="a" data-testid="radio-a" />
          <RadioRoot value="b" data-testid="radio-b" />
        </RadioGroup>
      `,
    }))

    await nextTick()

    const radioA = screen.getByTestId('radio-a')
    const radioB = screen.getByTestId('radio-b')

    expect(radioA).not.toHaveAttribute('tabindex', '0')
    expect(radioB).toHaveAttribute('tabindex', '0')
  })

  describe('with native <label>', () => {
    it('associates implicitly', async () => {
      const user = userEvent.setup()
      const changeSpy = vi.fn((newValue: string) => newValue)

      render(createRadioGroupApp({
        setup() {
          return { changeSpy }
        },
        template: `
          <RadioGroup @value-change="changeSpy">
            <label data-testid="label">
              <RadioRoot value="apple" />
              Apple
            </label>

            <label data-testid="label">
              <RadioRoot value="banana" />
              Banana
            </label>
          </RadioGroup>
        `,
      }))

      const [label1, label2] = screen.getAllByTestId('label')

      await user.click(label1)
      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy.mock.results.at(-1)?.value).toBe('apple')

      await user.click(label2)
      expect(changeSpy).toHaveBeenCalledTimes(2)
      expect(changeSpy.mock.results.at(-1)?.value).toBe('banana')
    })

    it('associates explicitly', async () => {
      const user = userEvent.setup()
      const changeSpy = vi.fn((newValue: string) => newValue)

      render(createRadioGroupApp({
        setup() {
          return { changeSpy }
        },
        template: `
          <RadioGroup @value-change="changeSpy">
            <div>
              <label data-testid="label" for="RadioA">Apple</label>
              <RadioRoot value="apple" id="RadioA" />
            </div>

            <div>
              <label data-testid="label" for="RadioB">Banana</label>
              <RadioRoot value="banana" id="RadioB" />
            </div>
          </RadioGroup>
        `,
      }))

      const [label1, label2] = screen.getAllByTestId('label')

      await user.click(label1)
      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy.mock.results.at(-1)?.value).toBe('apple')

      await user.click(label2)
      expect(changeSpy).toHaveBeenCalledTimes(2)
      expect(changeSpy.mock.results.at(-1)?.value).toBe('banana')
    })
  })

  describe('field', () => {
    it('passes the `name` prop to the radio input', () => {
      render(createRadioGroupApp({
        template: `
          <FieldRoot name="test" data-testid="field">
            <RadioGroup name="group">
              <FieldItem>
                <RadioRoot value="a" data-testid="item" />
              </FieldItem>
            </RadioGroup>
          </FieldRoot>
        `,
      }))

      const input = getRadioInput(screen.getByTestId('item'))

      expect(input).toHaveAttribute('name', 'test')
    })

    describe('field.Root', () => {
      it('should receive disabled prop from Field.Root', () => {
        render(createRadioGroupApp({
          template: `
            <FieldRoot disabled>
              <RadioGroup>
                <FieldItem>
                  <RadioRoot value="a" data-testid="radio" />
                </FieldItem>
              </RadioGroup>
            </FieldRoot>
          `,
        }))

        const radioGroup = screen.getByRole('radiogroup')
        const radio = screen.getByTestId('radio')

        expect(radioGroup).toHaveAttribute('aria-disabled', 'true')
        expect(radioGroup).toHaveAttribute('data-disabled')
        expect(radio).toHaveAttribute('aria-disabled', 'true')
        expect(radio).toHaveAttribute('data-disabled')
      })

      it('should receive name prop from Field.Root', () => {
        render(createRadioGroupApp({
          template: `
            <FieldRoot name="field-radio">
              <RadioGroup value="a">
                <FieldItem>
                  <RadioRoot value="a" data-testid="radio" />
                </FieldItem>
              </RadioGroup>
            </FieldRoot>
          `,
        }))

        const input = getRadioInput(screen.getByTestId('radio'))

        expect(input).toHaveAttribute('name', 'field-radio')
      })
    })

    describe('field.Description', () => {
      it('links the group and individual radios', async () => {
        render(createRadioGroupApp({
          template: `
            <FieldRoot name="apple">
              <RadioGroup :default-value="[]"
                aria-describedby="external-description"
              >
                <FieldDescription data-testid="group-description">
                  Group description
                </FieldDescription>
                <FieldItem>
                  <FieldLabel>
                    <RadioRoot
                      value="fuji-apple"
                      aria-describedby="radio-description"
                    />
                    Fuji
                  </FieldLabel>
                </FieldItem>
              </RadioGroup>
            </FieldRoot>
          `,
        }))

        await nextTick()

        const groupDescription = screen.getByTestId('group-description')
        const groupDescriptionId = groupDescription.getAttribute('id')

        expect(groupDescriptionId).not.toBeNull()
        expect(screen.getByRole('radiogroup').getAttribute('aria-describedby')).toContain(
          groupDescriptionId,
        )
        expect(screen.getByRole('radio').getAttribute('aria-describedby')).toContain(
          groupDescriptionId,
        )
        expect(screen.getByRole('radio')).toHaveAttribute(
          'aria-describedby',
          `radio-description ${groupDescriptionId}`,
        )
        expect(screen.getByRole('radiogroup')).toHaveAttribute(
          'aria-describedby',
          `external-description ${groupDescriptionId}`,
        )
      })
    })
  })

  describe('fieldset', () => {
    it('renders as the radio group when passed to FieldsetRoot as `as`', async () => {
      render(createRadioGroupApp({
        template: `
          <FieldRoot name="storageType">
            <FieldsetRoot :as="RadioGroup" default-value="ssd" data-testid="group">
              <FieldsetLegend>Storage type</FieldsetLegend>
              <label>
                <RadioRoot value="ssd" data-testid="ssd" />
                SSD
              </label>
              <label>
                <RadioRoot value="hdd" data-testid="hdd" />
                HDD
              </label>
            </FieldsetRoot>
          </FieldRoot>
        `,
        setup() {
          return { RadioGroup }
        },
      }))

      await nextTick()

      const legend = screen.getByText('Storage type')
      const radioGroup = screen.getByTestId('group')

      expect(radioGroup).toHaveAttribute('role', 'radiogroup')
      expect(radioGroup.getAttribute('aria-labelledby')).toBe(legend.getAttribute('id'))
      expect(screen.getByTestId('ssd')).toHaveAttribute('aria-checked', 'true')
      expect(screen.getByTestId('hdd')).toHaveAttribute('aria-checked', 'false')
    })

    it('labels the radio group from the fieldset legend', async () => {
      render(createRadioGroupApp({
        template: `
          <FieldRoot name="test">
            <FieldsetRoot :as="Slot" v-slot="{ props }">
              <RadioGroup v-bind="props">
                <FieldsetLegend>Legend</FieldsetLegend>
                <FieldItem>
                  <RadioRoot value="a" />
                </FieldItem>
              </RadioGroup>
            </FieldsetRoot>
          </FieldRoot>
        `,
        setup() {
          return { Slot }
        },
      }))

      await nextTick()

      const legend = screen.getByText('Legend')
      const radioGroup = screen.getByRole('radiogroup')

      expect(radioGroup.getAttribute('aria-labelledby')).toBe(legend.getAttribute('id'))
    })
  })

  it('provides uncontrolled value state to radio roots', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()

    render(createRadioGroupApp({
      setup() {
        return { handleValueChange }
      },
      template: `
        <RadioGroup default-value="a" @value-change="handleValueChange">
          <RadioRoot value="a" data-testid="a" />
          <RadioRoot value="b" data-testid="b" />
        </RadioGroup>
      `,
    }))

    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('b')).toHaveAttribute('aria-checked', 'false')

    await user.click(screen.getByTestId('b'))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange.mock.calls[0][0]).toBe('b')
    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByTestId('b')).toHaveAttribute('aria-checked', 'true')
  })

  it('supports controlled value updates', async () => {
    const user = userEvent.setup()

    render(createRadioGroupApp({
      setup() {
        const value = ref('a')
        return { value }
      },
      template: `
        <div>
          <button type="button" @click="value = 'b'">Choose B</button>
          <RadioGroup :value="value" @value-change="(nextValue) => value = nextValue">
            <RadioRoot value="a" data-testid="a" />
            <RadioRoot value="b" data-testid="b" />
          </RadioGroup>
        </div>
      `,
    }))

    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('button', { name: 'Choose B' }))

    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByTestId('b')).toHaveAttribute('aria-checked', 'true')
  })

  it('selects the focused radio when navigating with arrow keys', async () => {
    const user = userEvent.setup()

    render(createRadioGroupApp({
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" data-testid="a" />
          <RadioRoot value="b" data-testid="b" />
        </RadioGroup>
      `,
    }))

    const radioA = screen.getByTestId('a')
    const radioB = screen.getByTestId('b')

    radioA.focus()
    expect(radioA).toHaveFocus()

    await user.keyboard('[ArrowRight]')

    expect(radioB).toHaveFocus()
    expect(radioB).toHaveAttribute('aria-checked', 'true')
  })

  it('submits the selected radio value with a native form', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn((event: SubmitEvent) => {
      event.preventDefault()
      return Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement))
    })

    render(createRadioGroupApp({
      setup() {
        return { handleSubmit }
      },
      template: `
        <form @submit="handleSubmit">
          <RadioGroup default-value="b" name="storage" required>
            <RadioRoot value="a" />
            <RadioRoot value="b" />
          </RadioGroup>
          <button type="submit">Submit</button>
        </form>
      `,
    }))

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(handleSubmit).toHaveReturnedWith({ storage: 'b' })
  })

  it('supports renderless mode', () => {
    render(createRadioGroupApp({
      setup() {
        return { Slot }
      },
      template: `
        <RadioGroup default-value="a" :as="Slot" v-slot="{ props, state }">
          <div v-bind="props" data-testid="group">
            {{ state.disabled ? 'disabled' : 'enabled' }}
            <RadioRoot value="a" />
          </div>
        </RadioGroup>
      `,
    }))

    expect(screen.getByTestId('group')).toHaveTextContent('enabled')
    expect(screen.getByTestId('group')).toHaveAttribute('role', 'radiogroup')
  })
})
