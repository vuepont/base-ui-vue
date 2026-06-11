import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { RadioIndicator, RadioRoot } from '..'
import { FieldLabel, FieldRoot } from '../../field'
import Form from '../../form/Form.vue'
import { RadioGroup } from '../../radio-group'
import { Slot } from '../../utils/slot'

function createRadioApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      FieldLabel,
      FieldRoot,
      Form,
      RadioGroup,
      RadioIndicator,
      RadioRoot,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<RadioRoot />', () => {
  it('renders a span radio and hidden native radio input', () => {
    render(createRadioApp({
      template: `
        <RadioGroup default-value="a" name="choice">
          <RadioRoot value="a" data-testid="radio" />
        </RadioGroup>
      `,
    }))

    const radio = screen.getByTestId('radio')
    const input = document.querySelector('input[type="radio"]') as HTMLInputElement

    expect(radio.tagName).toBe('SPAN')
    expect(radio).toHaveAttribute('role', 'radio')
    expect(radio).toHaveAttribute('aria-checked', 'true')
    expect(input).toBeInstanceOf(HTMLInputElement)
    expect(input.name).toBe('choice')
    expect(input.value).toBe('a')
    expect(input.checked).toBe(true)
  })

  it('does not forward `value` prop', () => {
    render(createRadioApp({
      template: `
        <RadioGroup>
          <RadioRoot value="test" data-testid="radio-root" />
        </RadioGroup>
      `,
    }))

    expect(screen.getByTestId('radio-root')).not.toHaveAttribute('value')
  })

  it('updates checked state through the group context when clicked', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" data-testid="a" />
          <RadioRoot value="b" data-testid="b" />
        </RadioGroup>
      `,
    }))

    const radioA = screen.getByTestId('a')
    const radioB = screen.getByTestId('b')

    expect(radioA).toHaveAttribute('aria-checked', 'true')
    expect(radioB).toHaveAttribute('aria-checked', 'false')

    await user.click(radioB)

    expect(radioA).toHaveAttribute('aria-checked', 'false')
    expect(radioB).toHaveAttribute('aria-checked', 'true')
  })

  it('allows `null` value', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      setup() {
        return { nullValue: null }
      },
      template: `
        <RadioGroup :default-value="nullValue">
          <RadioRoot :value="nullValue" data-testid="null-radio" />
          <RadioRoot value="a" data-testid="a-radio" />
        </RadioGroup>
      `,
    }))

    const nullRadio = screen.getByTestId('null-radio')
    const aRadio = screen.getByTestId('a-radio')

    expect(nullRadio).toHaveAttribute('aria-checked', 'true')

    await user.click(aRadio)

    expect(nullRadio).toHaveAttribute('aria-checked', 'false')
    expect(aRadio).toHaveAttribute('aria-checked', 'true')
  })

  it('serializes non-string values for the hidden input', () => {
    render(createRadioApp({
      setup() {
        return { value: { id: 1 } }
      },
      template: `
        <RadioGroup :default-value="value" name="choice">
          <RadioRoot :value="value" />
        </RadioGroup>
      `,
    }))

    const input = document.querySelector('input[type="radio"]') as HTMLInputElement
    expect(input.value).toBe('{"id":1}')
  })

  it('does not change the group value when the change is canceled', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn((_value, details: { cancel: () => void }) => {
      details.cancel()
    })

    render(createRadioApp({
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

    await user.click(screen.getByTestId('b'))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('b')).toHaveAttribute('aria-checked', 'false')
  })

  it('does not select a disabled radio', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" data-testid="a" />
          <RadioRoot value="b" disabled data-testid="b" />
        </RadioGroup>
      `,
    }))

    const disabledRadio = screen.getByTestId('b')
    expect(disabledRadio).toHaveAttribute('aria-disabled', 'true')
    expect(disabledRadio).not.toHaveAttribute('disabled')

    await user.click(disabledRadio)

    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    expect(disabledRadio).toHaveAttribute('aria-checked', 'false')
  })

  it('does not select a read-only radio', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" data-testid="a" />
          <RadioRoot value="b" read-only data-testid="b" />
        </RadioGroup>
      `,
    }))

    await user.click(screen.getByTestId('b'))

    expect(screen.getByTestId('a')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('b')).toHaveAttribute('aria-checked', 'false')
  })

  it('prevents Enter from selecting a focused radio while Space selects it', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" data-testid="a" />
          <RadioRoot value="b" data-testid="b" />
        </RadioGroup>
      `,
    }))

    const radioB = screen.getByTestId('b')
    radioB.focus()

    await user.keyboard('[Enter]')
    expect(radioB).toHaveAttribute('aria-checked', 'false')

    await user.keyboard('[Space]')
    expect(radioB).toHaveAttribute('aria-checked', 'true')
  })

  it('associates `id` with the native button when `nativeButton=true`', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      template: `
        <div>
          <label data-testid="label" for="myRadio">A</label>
          <RadioGroup default-value="b">
            <RadioRoot value="a" id="myRadio" as="button" native-button data-testid="a" />
            <RadioRoot value="b" data-testid="b" />
          </RadioGroup>
        </div>
      `,
    }))

    const radioA = screen.getByTestId('a')
    const hiddenInput = radioA.nextElementSibling as HTMLInputElement | null

    expect(radioA).toHaveAttribute('id', 'myRadio')
    expect(hiddenInput?.tagName).toBe('INPUT')
    expect(hiddenInput).not.toHaveAttribute('id', 'myRadio')

    await user.click(screen.getByTestId('label'))
    expect(radioA).toHaveAttribute('aria-checked', 'true')
  })

  it('sets `aria-labelledby` from a sibling label associated with the hidden input', async () => {
    render(createRadioApp({
      template: `
        <div>
          <label for="radio-input">Label</label>
          <RadioGroup>
            <RadioRoot value="a" id="radio-input" />
          </RadioGroup>
        </div>
      `,
    }))
    await nextTick()

    const label = screen.getByText('Label')
    expect(label.id).not.toBe('')
    expect(screen.getByRole('radio')).toHaveAttribute('aria-labelledby', label.id)
  })

  it('updates fallback `aria-labelledby` when the hidden input id changes', async () => {
    const user = userEvent.setup()

    render(createRadioApp({
      setup() {
        const id = ref('radio-input-a')
        return { id }
      },
      template: `
        <div>
          <label for="radio-input-a">Label A</label>
          <label for="radio-input-b">Label B</label>
          <RadioGroup>
            <RadioRoot value="a" :id="id" />
          </RadioGroup>
          <button type="button" @click="id = 'radio-input-b'">Toggle</button>
        </div>
      `,
    }))
    await nextTick()

    const radio = screen.getByRole('radio')
    const labelA = screen.getByText('Label A')

    expect(labelA.id).not.toBe('')
    expect(radio).toHaveAttribute('aria-labelledby', labelA.id)

    await user.click(screen.getByRole('button', { name: 'Toggle' }))

    await waitFor(() => {
      const labelB = screen.getByText('Label B')

      expect(labelB.id).not.toBe('')
      expect(labelA.id).not.toBe(labelB.id)
      expect(radio).toHaveAttribute('aria-labelledby', labelB.id)
    })
  })

  it('applies state data attributes', () => {
    render(createRadioApp({
      template: `
        <RadioGroup default-value="a" disabled read-only required>
          <RadioRoot value="a" data-testid="radio" />
        </RadioGroup>
      `,
    }))

    const radio = screen.getByTestId('radio')
    expect(radio).toHaveAttribute('data-checked', '')
    expect(radio).toHaveAttribute('data-disabled', '')
    expect(radio).toHaveAttribute('data-readonly', '')
    expect(radio).toHaveAttribute('data-required', '')
  })

  it('passes form and name from the group context to the hidden input', () => {
    render(createRadioApp({
      template: `
        <RadioGroup default-value="a" name="storage" form="external-form">
          <RadioRoot value="a" />
        </RadioGroup>
      `,
    }))

    const input = document.querySelector('input[type="radio"]') as HTMLInputElement
    expect(input.name).toBe('storage')
    expect(input).toHaveAttribute('form', 'external-form')
  })

  it('supports input-ref', () => {
    const inputRef = ref<HTMLInputElement | null>(null)

    render(createRadioApp({
      setup() {
        function setInputRef(element: HTMLInputElement | null) {
          inputRef.value = element
        }

        return { setInputRef }
      },
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" :input-ref="setInputRef" />
        </RadioGroup>
      `,
    }))

    expect(inputRef.value).toBeInstanceOf(HTMLInputElement)
  })

  it('supports renderless mode and exposes props/state', () => {
    render(createRadioApp({
      setup() {
        return { Slot }
      },
      template: `
        <RadioGroup default-value="a">
          <RadioRoot value="a" :as="Slot" v-slot="{ props, ref, state }">
            <span v-bind="props" :ref="ref" data-testid="radio">
              {{ state.checked ? 'checked' : 'unchecked' }}
            </span>
          </RadioRoot>
        </RadioGroup>
      `,
    }))

    const radio = screen.getByTestId('radio')
    expect(radio).toHaveTextContent('checked')
    expect(radio).toHaveAttribute('role', 'radio')
    expect(radio).toHaveAttribute('data-checked', '')
  })

  it('uses the standalone fallback checked state for an empty value', () => {
    render(createRadioApp({
      template: `<RadioRoot value="" data-testid="radio" />`,
    }))

    expect(screen.getByTestId('radio')).toHaveAttribute('aria-checked', 'true')
  })
})
