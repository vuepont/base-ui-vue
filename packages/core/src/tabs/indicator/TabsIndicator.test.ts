import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, defineComponent, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import CSPProvider from '../../csp-provider/CSPProvider.vue'
import { Slot } from '../../utils/slot'
import TabsList from '../list/TabsList.vue'
import TabsRoot from '../root/TabsRoot.vue'
import TabsTab from '../tab/TabsTab.vue'
import TabsIndicator from './TabsIndicator.vue'

function createTabsApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      CSPProvider,
      Slot,
      TabsIndicator,
      TabsList,
      TabsRoot,
      TabsTab,
    },
    setup,
    template,
  })
}

function renderTabsToString(template: string, setup?: () => Record<string, unknown>) {
  return renderToString(createSSRApp(createTabsApp(template, setup)))
}

async function flushTabs() {
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

const resizeObserverCallbacks: ResizeObserverCallback[] = []

function installResizeObserverMock() {
  resizeObserverCallbacks.length = 0

  class ResizeObserverMock {
    callback: ResizeObserverCallback

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
      resizeObserverCallbacks.push(callback)
    }

    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
  }

  vi.stubGlobal('ResizeObserver', ResizeObserverMock)
}

function triggerResizeObservers() {
  resizeObserverCallbacks.forEach((callback) => {
    callback([], {} as ResizeObserver)
  })
}

afterEach(() => {
  resizeObserverCallbacks.length = 0
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

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

function setReadonlyProperty(element: HTMLElement, property: string, value: number) {
  Object.defineProperty(element, property, {
    configurable: true,
    value,
  })
}

function mockElementLayout(element: HTMLElement, options: LayoutOptions) {
  const {
    left = 0,
    top = 0,
    width,
    height,
    rectWidth = width,
    rectHeight = height,
    scrollWidth = width,
    scrollHeight = height,
    clientLeft = 0,
    clientTop = 0,
  } = options

  element.style.width = `${width}px`
  element.style.height = `${height}px`

  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(createRect({
    left,
    top,
    width: rectWidth,
    height: rectHeight,
  }))

  setReadonlyProperty(element, 'offsetWidth', width)
  setReadonlyProperty(element, 'offsetHeight', height)
  setReadonlyProperty(element, 'offsetLeft', left)
  setReadonlyProperty(element, 'offsetTop', top)
  setReadonlyProperty(element, 'scrollWidth', scrollWidth)
  setReadonlyProperty(element, 'scrollHeight', scrollHeight)
  setReadonlyProperty(element, 'clientLeft', clientLeft)
  setReadonlyProperty(element, 'clientTop', clientTop)
}

function expectCloseTo(actual: string, expected: number) {
  expect(Math.abs(Number.parseFloat(actual) - expected)).toBeLessThanOrEqual(0.01)
}

function assertIndicatorVariables(
  indicator: HTMLElement,
  tabList: HTMLElement,
  activeTab: HTMLElement,
) {
  const tabRect = activeTab.getBoundingClientRect()
  const tabListRect = tabList.getBoundingClientRect()
  const tabWidth = activeTab.offsetWidth
  const tabHeight = activeTab.offsetHeight
  const scaleX = tabList.offsetWidth > 0 ? tabListRect.width / tabList.offsetWidth : 1
  const scaleY = tabList.offsetHeight > 0 ? tabListRect.height / tabList.offsetHeight : 1
  const relativeLeft
    = (tabRect.left - tabListRect.left) / scaleX + tabList.scrollLeft - tabList.clientLeft
  const relativeTop
    = (tabRect.top - tabListRect.top) / scaleY + tabList.scrollTop - tabList.clientTop
  const relativeRight = tabList.scrollWidth - relativeLeft - tabWidth
  const relativeBottom = tabList.scrollHeight - relativeTop - tabHeight

  expectCloseTo(indicator.style.getPropertyValue('--active-tab-left'), relativeLeft)
  expectCloseTo(indicator.style.getPropertyValue('--active-tab-right'), relativeRight)
  expectCloseTo(indicator.style.getPropertyValue('--active-tab-top'), relativeTop)
  expectCloseTo(indicator.style.getPropertyValue('--active-tab-bottom'), relativeBottom)
  expectCloseTo(indicator.style.getPropertyValue('--active-tab-width'), tabWidth)
  expectCloseTo(indicator.style.getPropertyValue('--active-tab-height'), tabHeight)
}

function mockHorizontalTabLayouts(tabList: HTMLElement, tabs: HTMLElement[]) {
  mockElementLayout(tabList, {
    width: 300,
    height: 40,
    scrollWidth: 300,
    scrollHeight: 40,
  })
  mockElementLayout(tabs[0], { left: 0, top: 0, width: 70, height: 32 })
  mockElementLayout(tabs[1], { left: 70, top: 0, width: 90, height: 32 })
  mockElementLayout(tabs[2], { left: 160, top: 0, width: 110, height: 32 })
}

describe('<TabsIndicator />', () => {
  it('should not render when no tab is active', () => {
    render(createTabsApp(`
      <TabsRoot :value="null">
        <TabsList>
          <TabsIndicator data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `))

    expect(screen.queryByTestId('bubble')).not.toBeInTheDocument()
  })

  it('does not render the prehydration script by default during SSR', async () => {
    const html = await renderTabsToString(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsIndicator data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `)

    expect(html).toContain('data-testid="bubble"')
    expect(html).not.toContain('document.currentScript')
  })

  it('renders the inline pre-hydration script during server-side rendering', async () => {
    const html = await renderTabsToString(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsIndicator render-before-hydration data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `)

    const indicatorIndex = html.indexOf('data-testid="bubble"')
    const scriptIndex = html.indexOf('<script')

    expect(indicatorIndex).toBeGreaterThan(-1)
    expect(scriptIndex).toBeGreaterThan(indicatorIndex)
    expect(html).toContain('document.currentScript?.previousElementSibling')
    expect(html).toContain('--active-tab-')
  })

  it('applies CSP nonce to the inline pre-hydration script during server-side rendering', async () => {
    const html = await renderTabsToString(`
      <CSPProvider nonce="tabs-nonce">
        <TabsRoot default-value="one">
          <TabsList>
            <TabsTab value="one">One</TabsTab>
            <TabsIndicator render-before-hydration data-testid="bubble" />
          </TabsList>
        </TabsRoot>
      </CSPProvider>
    `)

    const indicatorIndex = html.indexOf('data-testid="bubble"')
    const scriptIndex = html.indexOf('<script')

    expect(indicatorIndex).toBeGreaterThan(-1)
    expect(scriptIndex).toBeGreaterThan(indicatorIndex)
    expect(html).toContain('nonce="tabs-nonce"')
  })

  it('does not render the prehydration script when no tab is active during SSR', async () => {
    const html = await renderTabsToString(`
      <TabsRoot :value="null">
        <TabsList>
          <TabsIndicator render-before-hydration data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `)

    expect(html).not.toContain('data-testid="bubble"')
    expect(html).not.toContain('document.currentScript')
  })

  it('does not leave the prehydration script mounted after client render', async () => {
    const { container } = render(createTabsApp(`
      <TabsRoot default-value="one">
        <TabsList>
          <TabsTab value="one">One</TabsTab>
          <TabsIndicator render-before-hydration data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()

    expect(screen.getByTestId('bubble')).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
  })

  it('exposes null active tab state when the selected value has no matching tab', async () => {
    render(createTabsApp(
      `
        <TabsRoot value="missing">
          <TabsList>
            <TabsTab value="one">One</TabsTab>
            <TabsIndicator :as="Slot" v-slot="{ props, ref, state }">
              <span
                data-testid="bubble"
                v-bind="props"
                :ref="ref"
                :data-position="state.activeTabPosition === null ? 'null' : 'set'"
                :data-size="state.activeTabSize === null ? 'null' : 'set'"
              />
            </TabsIndicator>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ Slot }),
    ))

    await waitFor(() => {
      expect(screen.getByTestId('bubble')).toHaveAttribute('data-position', 'null')
      expect(screen.getByTestId('bubble')).toHaveAttribute('data-size', 'null')
      expect(screen.getByTestId('bubble')).toHaveAttribute('hidden')
    })
  })

  it('should set CSS variables corresponding to the active tab', async () => {
    installResizeObserverMock()

    render(createTabsApp(`
      <TabsRoot :value="2">
        <TabsList data-testid="tab-list">
          <TabsTab :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
          <TabsTab :value="3">Three</TabsTab>
          <TabsIndicator data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const tabs = screen.getAllByRole('tab')

    mockHorizontalTabLayouts(tabList, tabs)
    triggerResizeObservers()

    await waitFor(() => {
      expect(bubble).not.toHaveAttribute('hidden')
      assertIndicatorVariables(bubble, tabList, tabs[1])
    })
  })

  it('should update the position and movement variables when the active tab changes', async () => {
    installResizeObserverMock()
    const selectedValue = ref(2)

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue">
          <TabsList data-testid="tab-list">
            <TabsTab :value="1">One</TabsTab>
            <TabsTab :value="2">Two</TabsTab>
            <TabsTab :value="3">Three</TabsTab>
            <TabsIndicator data-testid="bubble" />
          </TabsList>
        </TabsRoot>
      `,
      () => ({ selectedValue }),
    ))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const tabs = screen.getAllByRole('tab')
    mockHorizontalTabLayouts(tabList, tabs)

    selectedValue.value = 3
    triggerResizeObservers()
    await flushTabs()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, tabs[2])
    })

    selectedValue.value = 1
    triggerResizeObservers()
    await flushTabs()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, tabs[0])
    })
  })

  it('should update the position variables when the tab list is resized', async () => {
    installResizeObserverMock()

    render(createTabsApp(`
      <TabsRoot :value="1">
        <TabsList data-testid="tab-list">
          <TabsTab :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
          <TabsIndicator data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const activeTab = screen.getAllByRole('tab')[0]

    mockElementLayout(tabList, { width: 400, height: 40, scrollWidth: 400, scrollHeight: 40 })
    mockElementLayout(activeTab, { left: 0, top: 0, width: 200, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })

    mockElementLayout(tabList, { width: 800, height: 40, scrollWidth: 800, scrollHeight: 40 })
    mockElementLayout(activeTab, { left: 0, top: 0, width: 400, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })
  })

  it('should account for scroll and border when the tab list is transformed', async () => {
    installResizeObserverMock()

    render(createTabsApp(`
      <TabsRoot :value="3">
        <TabsList data-testid="tab-list">
          <TabsTab :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
          <TabsTab :value="3">Three</TabsTab>
          <TabsTab :value="4">Four</TabsTab>
          <TabsTab :value="5">Five</TabsTab>
          <TabsIndicator data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const activeTab = screen.getAllByRole('tab')[2]

    tabList.scrollLeft = 80
    mockElementLayout(tabList, {
      left: 30,
      top: 45,
      width: 240,
      height: 52,
      rectWidth: 360,
      rectHeight: 78,
      scrollWidth: 640,
      scrollHeight: 52,
      clientLeft: 6,
      clientTop: 6,
    })
    mockElementLayout(activeTab, {
      left: 30 + (4 + 6 + 256) * 1.5,
      top: 45 + (4 + 6) * 1.5,
      width: 120,
      height: 32,
      rectWidth: 180,
      rectHeight: 48,
    })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })
  })

  it('updates position when a different tab resizes', async () => {
    installResizeObserverMock()

    render(createTabsApp(`
      <TabsRoot :value="2">
        <TabsList data-testid="tab-list">
          <TabsTab data-testid="first-tab" :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
          <TabsTab :value="3">Three</TabsTab>
          <TabsIndicator data-testid="bubble" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const firstTab = screen.getByTestId('first-tab')
    const activeTab = screen.getAllByRole('tab')[1]

    mockElementLayout(tabList, { width: 300, height: 40, scrollWidth: 300, scrollHeight: 40 })
    mockElementLayout(firstTab, { left: 0, top: 0, width: 100, height: 32 })
    mockElementLayout(activeTab, { left: 100, top: 0, width: 100, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })

    mockElementLayout(firstTab, { left: 0, top: 0, width: 140, height: 32 })
    mockElementLayout(activeTab, { left: 140, top: 0, width: 100, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })
  })

  it('updates position when a new tab is inserted and then resized', async () => {
    installResizeObserverMock()
    const insertedTabWidth = ref<number | null>(null)

    render(createTabsApp(
      `
        <TabsRoot :value="2">
          <TabsList data-testid="tab-list">
            <TabsTab v-if="insertedTabWidth != null" data-testid="inserted-tab" :value="0">
              Inserted
            </TabsTab>
            <TabsTab :value="1">One</TabsTab>
            <TabsTab :value="2">Two</TabsTab>
            <TabsTab :value="3">Three</TabsTab>
            <TabsIndicator data-testid="bubble" />
          </TabsList>
        </TabsRoot>
      `,
      () => ({ insertedTabWidth }),
    ))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    let tabs = screen.getAllByRole('tab')

    mockElementLayout(tabList, { width: 320, height: 40, scrollWidth: 320, scrollHeight: 40 })
    mockElementLayout(tabs[0], { left: 0, top: 0, width: 100, height: 32 })
    mockElementLayout(tabs[1], { left: 100, top: 0, width: 100, height: 32 })
    mockElementLayout(tabs[2], { left: 200, top: 0, width: 100, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, screen.getByRole('tab', { selected: true }))
    })

    insertedTabWidth.value = 60
    await flushTabs()
    tabs = screen.getAllByRole('tab')
    const insertedTab = screen.getByTestId('inserted-tab')

    mockElementLayout(insertedTab, { left: 0, top: 0, width: 60, height: 32 })
    mockElementLayout(tabs[1], { left: 60, top: 0, width: 100, height: 32 })
    mockElementLayout(tabs[2], { left: 160, top: 0, width: 100, height: 32 })
    mockElementLayout(tabs[3], { left: 260, top: 0, width: 100, height: 32 })
    mockElementLayout(tabList, { width: 320, height: 40, scrollWidth: 360, scrollHeight: 40 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, screen.getByRole('tab', { selected: true }))
    })

    insertedTabWidth.value = 120
    await flushTabs()
    mockElementLayout(insertedTab, { left: 0, top: 0, width: 120, height: 32 })
    mockElementLayout(tabs[1], { left: 120, top: 0, width: 100, height: 32 })
    mockElementLayout(tabs[2], { left: 220, top: 0, width: 100, height: 32 })
    mockElementLayout(tabs[3], { left: 320, top: 0, width: 100, height: 32 })
    mockElementLayout(tabList, { width: 320, height: 40, scrollWidth: 420, scrollHeight: 40 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, screen.getByRole('tab', { selected: true }))
    })
  })

  it('updates all indicators when a different tab resizes', async () => {
    installResizeObserverMock()

    render(createTabsApp(`
      <TabsRoot :value="2">
        <TabsList data-testid="tab-list">
          <TabsTab data-testid="first-tab" :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
          <TabsTab :value="3">Three</TabsTab>
          <TabsIndicator data-testid="bubble-1" />
          <TabsIndicator data-testid="bubble-2" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()
    const bubble1 = screen.getByTestId('bubble-1')
    const bubble2 = screen.getByTestId('bubble-2')
    const tabList = screen.getByTestId('tab-list')
    const firstTab = screen.getByTestId('first-tab')
    const activeTab = screen.getAllByRole('tab')[1]

    mockElementLayout(tabList, { width: 300, height: 40, scrollWidth: 300, scrollHeight: 40 })
    mockElementLayout(firstTab, { left: 0, top: 0, width: 100, height: 32 })
    mockElementLayout(activeTab, { left: 100, top: 0, width: 100, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble1, tabList, activeTab)
      assertIndicatorVariables(bubble2, tabList, activeTab)
    })

    mockElementLayout(firstTab, { left: 0, top: 0, width: 140, height: 32 })
    mockElementLayout(activeTab, { left: 140, top: 0, width: 100, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble1, tabList, activeTab)
      assertIndicatorVariables(bubble2, tabList, activeTab)
    })
  })

  it('perf: single tab resize does not fan out excessive indicator rerenders', async () => {
    installResizeObserverMock()
    const renderIndicatorSpy = vi.fn(() => '')
    const tabValues = Array.from({ length: 100 }, (_, index) => index + 1)

    render(createTabsApp(
      `
        <TabsRoot :value="50">
          <TabsList data-testid="tab-list">
            <TabsTab
              v-for="value in tabValues"
              :key="value"
              :data-testid="'tab-' + value"
              :value="value"
            >
              {{ value }}
            </TabsTab>
            <TabsIndicator :as="Slot" v-slot="{ props, ref }">
              <span data-testid="bubble" v-bind="props" :ref="ref">
                {{ renderIndicatorSpy() }}
              </span>
            </TabsIndicator>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ renderIndicatorSpy, Slot, tabValues }),
    ))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const renderedTabs = screen.getAllByRole('tab')
    const activeTab = renderedTabs[49]

    mockElementLayout(tabList, {
      width: 1200,
      height: 40,
      scrollWidth: 12000,
      scrollHeight: 40,
    })
    renderedTabs.forEach((tab, index) => {
      mockElementLayout(tab, {
        left: index * 120,
        top: 0,
        width: 120,
        height: 32,
      })
    })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })

    const firstTab = screen.getByTestId('tab-1')
    const initialRenderCount = renderIndicatorSpy.mock.calls.length
    mockElementLayout(firstTab, { left: 0, top: 0, width: 180, height: 32 })
    mockElementLayout(activeTab, { left: 49 * 120 + 60, top: 0, width: 120, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      assertIndicatorVariables(bubble, tabList, activeTab)
    })

    expect(renderIndicatorSpy.mock.calls.length - initialRenderCount).toBeLessThan(5)
  })

  it('merges consumer styles with measured CSS variables', async () => {
    installResizeObserverMock()

    render(createTabsApp(`
      <TabsRoot :value="1">
        <TabsList data-testid="tab-list">
          <TabsTab :value="1">One</TabsTab>
          <TabsIndicator data-testid="bubble" :style="{ color: 'red' }" />
        </TabsList>
      </TabsRoot>
    `))

    await flushTabs()
    const bubble = screen.getByTestId('bubble')
    const tabList = screen.getByTestId('tab-list')
    const activeTab = screen.getByRole('tab')

    mockElementLayout(tabList, { width: 100, height: 40, scrollWidth: 100, scrollHeight: 40 })
    mockElementLayout(activeTab, { left: 0, top: 0, width: 100, height: 32 })
    triggerResizeObservers()

    await waitFor(() => {
      expect(bubble).toHaveStyle({ color: 'rgb(255, 0, 0)' })
      assertIndicatorVariables(bubble, tabList, activeTab)
    })
  })
})
