import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { Slot } from '../../utils/slot'
import TabsList from '../list/TabsList.vue'
import TabsRoot from '../root/TabsRoot.vue'
import TabsTab from '../tab/TabsTab.vue'
import TabsPanel from './TabsPanel.vue'

function createTabsApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      Slot,
      TabsList,
      TabsPanel,
      TabsRoot,
      TabsTab,
    },
    setup,
    template,
  })
}

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

describe('<TabsPanel />', () => {
  let originalAnimationsDisabled: unknown

  beforeEach(() => {
    originalAnimationsDisabled = (globalThis as any).BASE_UI_ANIMATIONS_DISABLED
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = true
  })

  afterEach(() => {
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = originalAnimationsDisabled
  })

  it('keeps panels mounted when requested and hides inactive panels', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsTab value="two">Two</TabsTab>
        </TabsList>
        <TabsPanel value="one" keep-mounted data-testid="panel-one">Panel one</TabsPanel>
        <TabsPanel value="two" keep-mounted data-testid="panel-two">Panel two</TabsPanel>
      </TabsRoot>
    `))

    expect(screen.getByTestId('panel-one')).not.toHaveAttribute('hidden')
    expect(screen.getByTestId('panel-one')).toHaveAttribute('tabindex', '0')
    expect(screen.getByTestId('panel-two')).toHaveAttribute('hidden')
    expect(screen.getByTestId('panel-two')).toHaveAttribute('inert')

    await user.click(screen.getByRole('tab', { name: 'Two' }))

    expect(screen.getByTestId('panel-one')).toHaveAttribute('hidden')
    expect(screen.getByTestId('panel-two')).not.toHaveAttribute('hidden')
    expect(screen.getByTestId('panel-two')).toHaveAttribute('tabindex', '0')
  })

  it('unmounts inactive panels when keep-mounted is false', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsTab value="two">Two</TabsTab>
        </TabsList>
        <TabsPanel value="one">Panel one</TabsPanel>
        <TabsPanel value="two">Panel two</TabsPanel>
      </TabsRoot>
    `))

    expect(screen.getByText('Panel one')).toBeInTheDocument()
    expect(screen.queryByText('Panel two')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Two' }))

    expect(screen.queryByText('Panel one')).not.toBeInTheDocument()
    expect(screen.getByText('Panel two')).toBeInTheDocument()
  })

  it('exposes panel state through renderless mode', async () => {
    render(createTabsApp(
      `
        <TabsRoot value="one">
          <TabsList>
            <TabsTab value="one">One</TabsTab>
            <TabsTab value="two">Two</TabsTab>
          </TabsList>
          <TabsPanel value="one" :as="Slot" v-slot="{ props, ref, state }">
            <section
              v-bind="props"
              :ref="ref"
              data-testid="panel"
              :data-state-hidden="String(state.hidden)"
              :data-state-direction="state.tabActivationDirection"
            >
              Panel one
            </section>
          </TabsPanel>
        </TabsRoot>
      `,
      () => ({ Slot }),
    ))

    expect(screen.getByTestId('panel')).toHaveAttribute('data-state-hidden', 'false')
    expect(screen.getByTestId('panel')).toHaveAttribute('data-state-direction', 'none')
  })

  it('triggers enter animation via data-starting-style when mounting', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsTab value="two">Two</TabsTab>
        </TabsList>
        <TabsPanel value="one">Panel one</TabsPanel>
        <TabsPanel data-testid="panel-two" value="two">Panel two</TabsPanel>
      </TabsRoot>
    `))

    expect(screen.queryByTestId('panel-two')).toBeNull()

    await user.click(screen.getByRole('tab', { name: 'Two' }))

    const panel = screen.getByTestId('panel-two')
    expect(panel).toHaveAttribute('data-starting-style')

    await waitFor(() => {
      expect(panel).not.toHaveAttribute('data-starting-style')
    })
  })

  it('applies data-ending-style before unmount', async () => {
    const user = userEvent.setup()
    ;(globalThis as any).BASE_UI_ANIMATIONS_DISABLED = false

    const deferred = createDeferred()

    render(createTabsApp(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsTab value="two">Two</TabsTab>
        </TabsList>
        <TabsPanel data-testid="panel-one" value="one">Panel one</TabsPanel>
        <TabsPanel value="two">Panel two</TabsPanel>
      </TabsRoot>
    `))

    const panel = screen.getByTestId('panel-one')
    panel.getAnimations = () => [createAnimationStub(deferred.promise)]

    await user.click(screen.getByRole('tab', { name: 'Two' }))

    await waitFor(() => {
      expect(screen.getByTestId('panel-one')).toHaveAttribute('data-ending-style')
    })

    expect(screen.getByTestId('panel-one')).toBeInTheDocument()

    deferred.resolve()

    await waitFor(() => {
      expect(screen.queryByTestId('panel-one')).not.toBeInTheDocument()
    })
  })

  it('allows consumer attributes to override panel defaults', () => {
    render(createTabsApp(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
        </TabsList>
        <span id="custom-panel-label">Custom label</span>
        <TabsPanel
          aria-labelledby="custom-panel-label"
          data-testid="panel"
          role="region"
          tabindex="-1"
          value="one"
        >
          Panel one
        </TabsPanel>
      </TabsRoot>
    `))

    const panel = screen.getByTestId('panel')

    expect(panel).toHaveAttribute('aria-labelledby', 'custom-panel-label')
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute('tabindex', '-1')
  })
})
