import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { RadioIndicator, RadioRoot } from '..'
import { RadioGroup } from '../../radio-group'
import { Slot } from '../../utils/slot'

function createDeferred() {
  let resolve!: () => void
  const promise = new Promise<void>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function createAnimationStub(finishedSignal: Promise<void>): Animation {
  let animation!: Animation

  const ready = Promise.resolve().then(() => animation)
  const finished = finishedSignal.then(() => animation)

  animation = {
    currentTime: null,
    effect: null,
    finished,
    id: '',
    oncancel: null,
    onfinish: null,
    onremove: null,
    playState: 'running',
    playbackRate: 1,
    pending: false,
    ready,
    replaceState: 'active',
    startTime: null,
    timeline: null,
    cancel() {},
    commitStyles() {},
    finish() {},
    pause() {},
    persist() {},
    play() {
      return Promise.resolve(animation)
    },
    reverse() {},
    updatePlaybackRate() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return true
    },
  }

  return animation
}

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

  it('should remove the indicator when there is no exit animation defined', async () => {
    const user = userEvent.setup()

    render(defineComponent({
      components: { RadioGroup, RadioIndicator, RadioRoot },
      setup() {
        const value = ref('a')
        return { value }
      },
      template: `
        <div>
          <button type="button" @click="value = 'b'">Close</button>
          <RadioGroup :value="value">
            <RadioRoot value="a">
              <RadioIndicator data-testid="indicator-a" />
            </RadioRoot>
            <RadioRoot value="a">
              <RadioIndicator />
            </RadioRoot>
          </RadioGroup>
        </div>
      `,
    }))

    expect(screen.getByTestId('indicator-a')).toBeDefined()

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.queryByTestId('indicator-a')).toBeNull()
    })
  })

  it('should remove the indicator when the animation finishes', async () => {
    const user = userEvent.setup()
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = false

    const deferred = createDeferred()

    render(defineComponent({
      components: { RadioGroup, RadioIndicator, RadioRoot },
      setup() {
        const value = ref('a')
        return { value }
      },
      template: `
        <div>
          <button type="button" @click="value = 'b'">Close</button>
          <RadioGroup :value="value">
            <RadioRoot value="a">
              <RadioIndicator data-testid="indicator-a" />
            </RadioRoot>
            <RadioRoot value="a">
              <RadioIndicator />
            </RadioRoot>
          </RadioGroup>
        </div>
      `,
    }))

    const indicator = screen.getByTestId('indicator-a')
    indicator.getAnimations = () => [createAnimationStub(deferred.promise)]

    await user.click(screen.getByRole('button', { name: 'Close' }))

    await waitFor(() => {
      expect(screen.getByTestId('indicator-a')).toHaveAttribute('data-ending-style')
    })

    deferred.resolve()

    await waitFor(() => {
      expect(screen.queryByTestId('indicator-a')).toBeNull()
    })
  })

  describe('animations', () => {
    afterEach(() => {
      ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = true
    })

    it('triggers enter animation via data-starting-style when mounting', async () => {
      ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = false

      render(defineComponent({
        components: { RadioGroup, RadioIndicator, RadioRoot },
        setup() {
          const value = ref('b')
          return { value }
        },
        template: `
          <div>
            <button type="button" @click="value = 'a'">Select a</button>
            <RadioGroup :value="value">
              <RadioRoot value="a">
                <RadioIndicator data-testid="indicator-a" />
              </RadioRoot>
              <RadioRoot value="b">
                <RadioIndicator data-testid="indicator-b" />
              </RadioRoot>
            </RadioGroup>
          </div>
        `,
      }))

      expect(screen.queryByTestId('indicator-a')).toBeNull()

      await fireEvent.click(screen.getByText('Select a'))

      const indicator = screen.getByTestId('indicator-a')
      expect(indicator).toHaveAttribute('data-starting-style')

      await waitFor(() => {
        expect(indicator).not.toHaveAttribute('data-starting-style')
      })

      expect(screen.getByTestId('indicator-a')).toBeDefined()
    })

    it('applies data-ending-style before unmount', async () => {
      const user = userEvent.setup()
      ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = false

      const deferred = createDeferred()

      render(defineComponent({
        components: { RadioGroup, RadioIndicator, RadioRoot },
        setup() {
          const value = ref('a')
          return { value }
        },
        template: `
          <div>
            <button type="button" @click="value = 'b'">Select b</button>
            <RadioGroup :value="value">
              <RadioRoot value="a">
                <RadioIndicator data-testid="indicator-a" />
              </RadioRoot>
              <RadioRoot value="b">
                <RadioIndicator data-testid="indicator-b" />
              </RadioRoot>
            </RadioGroup>
          </div>
        `,
      }))

      const indicator = screen.getByTestId('indicator-a')
      indicator.getAnimations = () => [createAnimationStub(deferred.promise)]

      await user.click(screen.getByText('Select b'))

      await waitFor(() => {
        expect(screen.getByTestId('indicator-a')).toHaveAttribute('data-ending-style')
      })

      expect(screen.getByTestId('indicator-a')).toBeDefined()

      deferred.resolve()

      await waitFor(() => {
        expect(screen.queryByTestId('indicator-a')).toBeNull()
      })
    })
  })
})
