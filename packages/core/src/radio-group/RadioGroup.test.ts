import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { RadioGroup } from '.'
import { RadioIndicator, RadioRoot } from '../radio'
import { Slot } from '../utils/slot'

function createRadioGroupApp(options: {
  template: string
  setup?: () => Record<string, any>
}) {
  return defineComponent({
    components: {
      RadioGroup,
      RadioIndicator,
      RadioRoot,
    },
    setup: options.setup,
    template: options.template,
  })
}

describe('<RadioGroup />', () => {
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
