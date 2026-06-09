import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { RadioIndicator, RadioRoot } from '..'
import { Slot } from '../../utils/slot'

describe('<RadioIndicator />', () => {
  let originalAnimationsDisabled: unknown

  beforeEach(() => {
    originalAnimationsDisabled = (globalThis as any).BASE_UI_ANIMATIONS_DISABLED
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = true
  })

  afterEach(() => {
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = originalAnimationsDisabled
  })

  it('does not render the indicator when unchecked', () => {
    render(defineComponent({
      components: { RadioIndicator, RadioRoot },
      template: `
        <RadioRoot value="a">
          <RadioIndicator data-testid="indicator" />
        </RadioRoot>
      `,
    }))

    expect(screen.queryByTestId('indicator')).toBeNull()
  })

  it('renders the indicator when checked', () => {
    render(defineComponent({
      components: { RadioIndicator, RadioRoot },
      template: `
        <RadioRoot value="">
          <RadioIndicator data-testid="indicator" />
        </RadioRoot>
      `,
    }))

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('keeps the indicator mounted when keep-mounted is set', () => {
    render(defineComponent({
      components: { RadioIndicator, RadioRoot },
      template: `
        <RadioRoot value="a">
          <RadioIndicator keep-mounted data-testid="indicator" />
        </RadioRoot>
      `,
    }))

    expect(screen.getByTestId('indicator')).toHaveAttribute('data-unchecked', '')
  })

  it('applies radio state attributes', () => {
    render(defineComponent({
      components: { RadioIndicator, RadioRoot },
      template: `
        <RadioRoot value="" disabled read-only required>
          <RadioIndicator data-testid="indicator" />
        </RadioRoot>
      `,
    }))

    const indicator = screen.getByTestId('indicator')
    expect(indicator).toHaveAttribute('data-checked', '')
    expect(indicator).toHaveAttribute('data-disabled', '')
    expect(indicator).toHaveAttribute('data-readonly', '')
    expect(indicator).toHaveAttribute('data-required', '')
  })

  it('supports renderless mode and exposes props/state', () => {
    render(defineComponent({
      components: { RadioIndicator, RadioRoot },
      setup() {
        return { Slot }
      },
      template: `
        <RadioRoot value="">
          <RadioIndicator :as="Slot" v-slot="{ props, ref, state }">
            <span v-bind="props" :ref="ref" data-testid="indicator">
              {{ state.checked ? 'checked' : 'unchecked' }}
            </span>
          </RadioIndicator>
        </RadioRoot>
      `,
    }))

    const indicator = screen.getByTestId('indicator')
    expect(indicator).toHaveTextContent('checked')
    expect(indicator).toHaveAttribute('data-checked', '')
  })

  it('removes the indicator when unchecked after being checked', async () => {
    const user = userEvent.setup()

    render(defineComponent({
      components: { RadioIndicator, RadioRoot },
      setup() {
        const value = ref('')
        return { value }
      },
      template: `
        <div>
          <button type="button" @click="value = 'a'">Uncheck</button>
          <RadioRoot :value="value">
            <RadioIndicator data-testid="indicator" />
          </RadioRoot>
        </div>
      `,
    }))

    expect(screen.getByTestId('indicator')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Uncheck' }))

    await waitFor(() => {
      expect(screen.queryByTestId('indicator')).toBeNull()
    })
  })
})
