import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { CheckboxIndicator, CheckboxRoot } from '..'

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

describe('<CheckboxIndicator />', () => {
  let originalAnimationsDisabled: unknown

  beforeEach(() => {
    originalAnimationsDisabled = (globalThis as any).BASE_UI_ANIMATIONS_DISABLED
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = true
  })

  afterEach(() => {
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = originalAnimationsDisabled
  })

  it('should not render indicator by default', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot>
            <CheckboxIndicator data-testid="indicator" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.queryByTestId('indicator')).toBeNull()
  })

  it('should keep indicator mounted when unchecked', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot>
            <CheckboxIndicator keep-mounted data-testid="indicator" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('should render indicator when checked', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot checked>
            <CheckboxIndicator data-testid="indicator" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('should keep indicator mounted when checked', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot checked>
            <CheckboxIndicator keep-mounted data-testid="indicator" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('should keep indicator mounted when indeterminate', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot indeterminate>
            <CheckboxIndicator keep-mounted data-testid="indicator" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('renders when indeterminate', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot indeterminate>
            <CheckboxIndicator data-testid="indicator" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toBeDefined()
  })

  it('should spread extra props', () => {
    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        template: `
          <CheckboxRoot checked>
            <CheckboxIndicator data-testid="indicator" data-extra-prop="Lorem ipsum" />
          </CheckboxRoot>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toHaveAttribute('data-extra-prop', 'Lorem ipsum')
  })

  it('should remove the indicator when there is no exit animation defined', async () => {
    const user = userEvent.setup()

    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        setup() {
          const checked = ref(true)
          return { checked }
        },
        template: `
          <div>
            <button type="button" @click="checked = false">Close</button>
            <CheckboxRoot :checked="checked">
              <CheckboxIndicator data-testid="indicator" />
            </CheckboxRoot>
          </div>
        `,
      }),
    )

    expect(screen.getByTestId('indicator')).toBeDefined()

    await user.click(screen.getByText('Close'))

    await waitFor(() => {
      expect(screen.queryByTestId('indicator')).toBeNull()
    })
  })

  it('triggers enter animation via data-starting-style when mounting', async () => {
    const user = userEvent.setup()

    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        setup() {
          const checked = ref(false)
          return { checked }
        },
        template: `
          <div>
            <button type="button" @click="checked = true">Check</button>
            <CheckboxRoot :checked="checked">
              <CheckboxIndicator data-testid="indicator" />
            </CheckboxRoot>
          </div>
        `,
      }),
    )

    expect(screen.queryByTestId('indicator')).toBeNull()

    await user.click(screen.getByText('Check'))

    const indicator = screen.getByTestId('indicator')
    expect(indicator).toHaveAttribute('data-starting-style')

    await waitFor(() => {
      expect(indicator).not.toHaveAttribute('data-starting-style')
    })
  })

  it('applies data-ending-style before unmount', async () => {
    const user = userEvent.setup()
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = false

    const deferred = createDeferred()

    render(
      defineComponent({
        components: { CheckboxRoot, CheckboxIndicator },
        setup() {
          const checked = ref(true)
          return { checked }
        },
        template: `
          <div>
            <button type="button" @click="checked = false">Uncheck</button>
            <CheckboxRoot :checked="checked">
              <CheckboxIndicator data-testid="indicator" />
            </CheckboxRoot>
          </div>
        `,
      }),
    )

    const indicator = screen.getByTestId('indicator')

    indicator.getAnimations = () => [createAnimationStub(deferred.promise)]

    await user.click(screen.getByText('Uncheck'))

    await waitFor(() => {
      expect(screen.getByTestId('indicator')).toHaveAttribute('data-ending-style')
    })

    expect(screen.getByTestId('indicator')).toBeDefined()

    deferred.resolve()

    await waitFor(() => {
      expect(screen.queryByTestId('indicator')).toBeNull()
    })
  })
})
