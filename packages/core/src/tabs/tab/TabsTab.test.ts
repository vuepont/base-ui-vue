import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { Slot } from '../../utils/slot'
import TabsList from '../list/TabsList.vue'
import TabsPanel from '../panel/TabsPanel.vue'
import TabsRoot from '../root/TabsRoot.vue'
import TabsTab from './TabsTab.vue'

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

async function flushTabs() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

interface LayoutOptions {
  left?: number
  top?: number
  width: number
  height: number
  rectWidth?: number
  rectHeight?: number
  scrollWidth?: number
  scrollHeight?: number
  clientLeft?: number
  clientTop?: number
}

function createRect(options: Required<Pick<LayoutOptions, 'left' | 'top' | 'width' | 'height'>>) {
  const { left, top, width, height } = options
  return {
    x: left,
    y: top,
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    toJSON: () => {},
  } as DOMRect
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('<TabsTab />', () => {
  it('selects the clicked tab', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="overview">
        <TabsList>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="projects">Projects</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel</TabsPanel>
        <TabsPanel value="projects">Projects panel</TabsPanel>
      </TabsRoot>
    `))

    await user.click(screen.getByRole('tab', { name: 'Projects' }))

    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Projects panel')).toBeInTheDocument()
    expect(screen.queryByText('Overview panel')).not.toBeInTheDocument()
  })

  it('should call onValueChange when clicking', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await user.click(screen.getAllByRole('tab')[1])

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange.mock.calls[0][0]).toBe(1)
  })

  it('does not select the clicked disabled tab', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot :default-value="0">
        <TabsList :activate-on-focus="false">
          <TabsTab :value="0">Tab 1</TabsTab>
          <TabsTab :value="1" disabled>Tab 2</TabsTab>
          <TabsTab :value="2">Tab 3</TabsTab>
        </TabsList>
        <TabsPanel :value="0" keep-mounted>Panel 1</TabsPanel>
        <TabsPanel :value="1" keep-mounted>Panel 2</TabsPanel>
        <TabsPanel :value="2" keep-mounted>Panel 3</TabsPanel>
      </TabsRoot>
    `))

    await user.click(screen.getByRole('tab', { name: 'Tab 2' }))

    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels[0]).not.toHaveAttribute('hidden')
    expect(panels[1]).toHaveAttribute('hidden')
    expect(panels[2]).toHaveAttribute('hidden')
  })

  it('renders as an anchor and toggles selection when `nativeButton` is false', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="overview">
        <TabsList>
          <TabsTab as="a" href="#overview" :native-button="false" value="overview">
            Overview
          </TabsTab>
          <TabsTab as="a" href="#details" :native-button="false" value="details">
            Details
          </TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0].tagName).toBe('A')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')

    await user.click(tabs[1])

    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should not call onValueChange on non-main button clicks', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Zero</TabsTab>
            <TabsTab :value="1">One</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await fireEvent.click(screen.getByRole('tab', { name: 'One' }), { button: 2 })

    expect(handleValueChange).not.toHaveBeenCalled()
  })

  it('should not call onValueChange when already active', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await user.click(screen.getAllByRole('tab')[0])

    expect(handleValueChange).not.toHaveBeenCalled()
  })

  it('exposes tab activation direction through the render prop', async () => {
    const selectedValue = ref(0)

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue">
          <TabsList>
            <TabsTab :value="0" :as="Slot" v-slot="{ props, ref, state }">
              <button
                v-bind="props"
                :ref="ref"
                data-testid="tab-0"
                :data-state-active="String(state.active)"
                :data-state-direction="state.tabActivationDirection"
              >
                Tab 0
              </button>
            </TabsTab>
            <TabsTab :value="1" :as="Slot" v-slot="{ props, ref, state }">
              <button
                v-bind="props"
                :ref="ref"
                data-testid="tab-1"
                :data-state-active="String(state.active)"
                :data-state-direction="state.tabActivationDirection"
              >
                Tab 1
              </button>
            </TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ selectedValue, Slot }),
    ))

    const tab0 = screen.getByTestId('tab-0')
    const tab1 = screen.getByTestId('tab-1')
    await waitFor(() => {
      expect(tab0).toHaveAttribute('aria-selected', 'true')
    })

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRect(this: HTMLElement) {
      const text = this.textContent?.trim()
      if (text === 'Tab 0') {
        return createRect({ left: 0, top: 0, width: 80, height: 32 })
      }
      if (text === 'Tab 1') {
        return createRect({ left: 100, top: 0, width: 80, height: 32 })
      }
      return createRect({ left: 0, top: 0, width: 0, height: 0 })
    })

    selectedValue.value = 1
    await flushTabs()

    await waitFor(() => {
      expect(tab1).toHaveAttribute('data-state-active', 'true')
      expect(tab1).toHaveAttribute('data-state-direction', 'right')
    })
  })
})
