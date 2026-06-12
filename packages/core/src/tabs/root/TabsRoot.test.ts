import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { Slot } from '../../utils/slot'
import TabsList from '../list/TabsList.vue'
import TabsPanel from '../panel/TabsPanel.vue'
import TabsTab from '../tab/TabsTab.vue'
import TabsRoot from './TabsRoot.vue'
import { useTabsRootContext } from './TabsRootContext'

const ConnectedMapCleanupProbe = defineComponent({
  name: 'ConnectedMapCleanupProbe',
  setup() {
    const root = useTabsRootContext()

    return {
      clearTabMap() {
        root.setTabMap(new Map())
      },
    }
  },
  template: '<button type="button" @click="clearTabMap">Clear tab map</button>',
})

function createTabsApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      ConnectedMapCleanupProbe,
      Slot,
      TabsList,
      TabsPanel,
      TabsRoot,
      TabsTab,
    },
    setup() {
      return {
        Slot,
        ...setup?.(),
      }
    },
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

describe('<TabsRoot />', () => {
  it('should accept a null child', () => {
    render(createTabsApp(`
      <TabsRoot :value="0">
        <template v-if="false">
          <TabsTab :value="-1">Hidden</TabsTab>
        </template>
        <TabsList>
          <TabsTab :value="1">Visible</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    expect(screen.getAllByRole('tab')).toHaveLength(1)
  })

  it('should support empty children', () => {
    render(createTabsApp('<TabsRoot :value="1" />'))

    expect(screen.queryByRole('tab')).not.toBeInTheDocument()
  })

  it('puts the selected child in tab order', async () => {
    const selectedValue = ref(1)

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue">
          <TabsList>
            <TabsTab :value="0">Zero</TabsTab>
            <TabsTab :value="1">One</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ selectedValue }),
    ))

    await waitFor(() => {
      expect(screen.getAllByRole('tab').map(tab => tab.tabIndex)).toEqual([-1, 0])
    })

    selectedValue.value = 0
    await flushTabs()

    expect(screen.getAllByRole('tab').map(tab => tab.tabIndex)).toEqual([0, -1])
  })

  it('syncs aria-controls to the mounted tab panel when keepMounted is false', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="tab-0">
        <TabsList>
          <TabsTab value="tab-0">Tab 0</TabsTab>
          <TabsTab value="tab-1">Tab 1</TabsTab>
        </TabsList>
        <TabsPanel value="tab-0">Panel 0</TabsPanel>
        <TabsPanel value="tab-1">Panel 1</TabsPanel>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    const [firstPanel] = screen.getAllByRole('tabpanel')

    await waitFor(() => {
      expect(tabs[0]).toHaveAttribute('aria-controls', firstPanel.id)
      expect(tabs[1]).not.toHaveAttribute('aria-controls')
    })

    await user.click(tabs[1])

    await waitFor(() => {
      const [secondPanel] = screen.getAllByRole('tabpanel')
      expect(secondPanel).toHaveTextContent('Panel 1')
      expect(tabs[0]).not.toHaveAttribute('aria-controls')
      expect(tabs[1]).toHaveAttribute('aria-controls', secondPanel.id)
    })
  })

  it('sets the aria-labelledby attribute on tab panels to the corresponding tab id', async () => {
    render(createTabsApp(`
      <TabsRoot default-value="tab-0">
        <TabsList>
          <TabsTab value="tab-0">Tab 0</TabsTab>
          <TabsTab id="explicit-tab-id-1" value="tab-1">Tab 1</TabsTab>
          <TabsTab value="tab-2">Tab 2</TabsTab>
          <TabsTab id="explicit-tab-id-3" value="tab-3">Tab 3</TabsTab>
        </TabsList>
        <TabsPanel value="tab-1" keep-mounted>Panel 1</TabsPanel>
        <TabsPanel value="tab-0" keep-mounted>Panel 0</TabsPanel>
        <TabsPanel value="tab-2" keep-mounted>Panel 2</TabsPanel>
        <TabsPanel value="tab-3" keep-mounted>Panel 3</TabsPanel>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    await waitFor(() => {
      expect(panels[0]).toHaveAttribute('aria-labelledby', tabs[1].id)
      expect(panels[1]).toHaveAttribute('aria-labelledby', tabs[0].id)
      expect(panels[2]).toHaveAttribute('aria-labelledby', tabs[2].id)
      expect(panels[3]).toHaveAttribute('aria-labelledby', tabs[3].id)
    })
  })

  it('sets the aria-controls attribute on tabs to the corresponding tab panel id', async () => {
    render(createTabsApp(`
      <TabsRoot default-value="tab-0">
        <TabsList>
          <TabsTab value="tab-0">Tab 0</TabsTab>
          <TabsTab id="explicit-tab-id-1" value="tab-1">Tab 1</TabsTab>
          <TabsTab value="tab-2">Tab 2</TabsTab>
          <TabsTab id="explicit-tab-id-3" value="tab-3">Tab 3</TabsTab>
        </TabsList>
        <TabsPanel value="tab-1" keep-mounted>Panel 1</TabsPanel>
        <TabsPanel value="tab-0" keep-mounted>Panel 0</TabsPanel>
        <TabsPanel value="tab-2" keep-mounted>Panel 2</TabsPanel>
        <TabsPanel value="tab-3" keep-mounted>Panel 3</TabsPanel>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    await waitFor(() => {
      expect(tabs[0]).toHaveAttribute('aria-controls', panels[1].id)
      expect(tabs[1]).toHaveAttribute('aria-controls', panels[0].id)
      expect(tabs[2]).toHaveAttribute('aria-controls', panels[2].id)
      expect(tabs[3]).toHaveAttribute('aria-controls', panels[3].id)
    })
  })

  it('sets aria-controls on the first tab when no value is provided', async () => {
    render(createTabsApp(`
      <TabsRoot>
        <TabsList>
          <TabsTab :value="0">Tab 0</TabsTab>
          <TabsTab :value="1">Tab 1</TabsTab>
        </TabsList>
        <TabsPanel :value="0" keep-mounted>Panel 0</TabsPanel>
        <TabsPanel :value="1" keep-mounted>Panel 1</TabsPanel>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    await waitFor(() => {
      expect(tabs[0]).toHaveAttribute('aria-controls', panels[0].id)
      expect(tabs[1]).toHaveAttribute('aria-controls', panels[1].id)
      expect(panels[0]).toHaveAttribute('aria-labelledby', tabs[0].id)
      expect(panels[1]).toHaveAttribute('aria-labelledby', tabs[1].id)
    })
  })

  it('should pass selected prop to children', () => {
    render(createTabsApp(`
      <TabsRoot :value="1">
        <TabsList>
          <TabsTab :value="0">Tab 0</TabsTab>
          <TabsTab :value="1">Tab 1</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('should support values of different types', async () => {
    const user = userEvent.setup()
    const values = [0, '1', { value: 2 }, () => 3, Symbol('4'), /5/]

    render(createTabsApp(
      `
        <TabsRoot :default-value="values[0]">
          <TabsList>
            <TabsTab v-for="(value, index) in values" :key="index" :value="value">
              Tab {{ index }}
            </TabsTab>
          </TabsList>
          <TabsPanel
            v-for="(value, index) in values"
            :key="index"
            :value="value"
            keep-mounted
          >
            Panel {{ index }}
          </TabsPanel>
        </TabsRoot>
      `,
      () => ({ values }),
    ))

    const tabs = screen.getAllByRole('tab')
    const panels = screen.getAllByRole('tabpanel', { hidden: true })

    for (let index = 0; index < values.length; index += 1) {
      await waitFor(() => {
        expect(panels[index]).toHaveAttribute('aria-labelledby', tabs[index].id)
      })

      await user.click(tabs[index])

      await waitFor(() => {
        expect(panels[index]).not.toHaveAttribute('hidden')
      })
    }
  })

  it('should select the second tab when the first one is disabled', async () => {
    render(createTabsApp(`
      <TabsRoot>
        <TabsList>
          <TabsTab :value="0" disabled>Disabled tab</TabsTab>
          <TabsTab :value="1">Enabled tab</TabsTab>
        </TabsList>
        <TabsPanel :value="0" keep-mounted>Disabled panel</TabsPanel>
        <TabsPanel :value="1" keep-mounted>Enabled panel</TabsPanel>
      </TabsRoot>
    `))

    const [disabledTab, enabledTab] = screen.getAllByRole('tab')
    const [disabledPanel, enabledPanel] = screen.getAllByRole('tabpanel', { hidden: true })

    await waitFor(() => {
      expect(disabledTab).toHaveAttribute('aria-selected', 'false')
      expect(enabledTab).toHaveAttribute('aria-selected', 'true')
      expect(disabledPanel).toHaveAttribute('hidden')
      expect(enabledPanel).not.toHaveAttribute('hidden')
      expect(enabledPanel).toHaveTextContent('Enabled panel')
    })
  })

  it('should select the third tab when first two tabs are disabled', async () => {
    render(createTabsApp(`
      <TabsRoot>
        <TabsList>
          <TabsTab :value="0" disabled>Tab 0</TabsTab>
          <TabsTab :value="1" disabled>Tab 1</TabsTab>
          <TabsTab :value="2">Tab 2</TabsTab>
          <TabsTab :value="3">Tab 3</TabsTab>
        </TabsList>
        <TabsPanel :value="0">Panel 0</TabsPanel>
        <TabsPanel :value="1">Panel 1</TabsPanel>
        <TabsPanel :value="2">Panel 2</TabsPanel>
        <TabsPanel :value="3">Panel 3</TabsPanel>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')

    await waitFor(() => {
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
      expect(tabs[3]).toHaveAttribute('aria-selected', 'false')
    })
  })

  it('should still honor explicit defaultValue even if it points to a disabled tab', () => {
    render(createTabsApp(`
      <TabsRoot :default-value="0">
        <TabsList>
          <TabsTab :value="0" disabled>Tab 0</TabsTab>
          <TabsTab :value="1">Tab 1</TabsTab>
          <TabsTab :value="2">Tab 2</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
  })

  it('continues honoring an initially disabled explicit defaultValue after defaultValue changes', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const defaultValue = ref(0)

    render(createTabsApp(
      `
      <TabsRoot :default-value="defaultValue">
        <TabsList>
          <TabsTab :value="0" disabled>Tab 0</TabsTab>
          <TabsTab :value="1">Tab 1</TabsTab>
          <TabsTab :value="2">Tab 2</TabsTab>
        </TabsList>
      </TabsRoot>
      `,
      () => ({ defaultValue }),
    ))

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')

    defaultValue.value = 1
    await flushTabs()

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('A component is changing the default value state of an uncontrolled TabsRoot after being initialized.'),
    )
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
  })

  it('should still honor explicit value prop even if it points to a disabled tab', () => {
    render(createTabsApp(`
      <TabsRoot :value="0">
        <TabsList>
          <TabsTab :value="0" disabled>Tab 0</TabsTab>
          <TabsTab :value="1">Tab 1</TabsTab>
          <TabsTab :value="2">Tab 2</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    expect(tabs[2]).toHaveAttribute('aria-selected', 'false')
  })

  it('treats defaultValue={undefined} as an implicit default when the first tab is disabled', async () => {
    const handleValueChange = vi.fn()
    const undefinedValue = undefined

    render(createTabsApp(
      `
        <TabsRoot :default-value="undefinedValue" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" disabled>Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange, undefinedValue }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange when auto-selecting the first tab on mount', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalled()
      expect(handleValueChange.mock.calls[0][0]).toBe(0)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
      expect(handleValueChange.mock.calls[0][1].activationDirection).toBe('none')
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange with the selected value when the implicit default matches a later tab', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(0)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'false')
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange when the implicit first tab is disabled', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" disabled>Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
      expect(handleValueChange.mock.calls[0][1].activationDirection).toBe('none')
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange with null when all tabs are initially disabled', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" disabled>Tab 0</TabsTab>
            <TabsTab :value="1" disabled>Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(null)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
      expect(handleValueChange.mock.calls[0][1].activationDirection).toBe('none')
    })

    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected', 'false')
    })
  })

  it('does not emit missing when an enabled tab appears after all tabs were disabled', async () => {
    const enableSecond = ref(false)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" disabled>Tab 0</TabsTab>
            <TabsTab :value="1" :disabled="!enableSecond">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ enableSecond, handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(null)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
    })

    enableSecond.value = true
    await flushTabs()

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'false')
    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('does not call onValueChange on initial render when defaultValue is provided', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="1" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await flushTabs()

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('does not call onValueChange on initial render when defaultValue is null', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="null" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await flushTabs()

    expect(handleValueChange).not.toHaveBeenCalled()
    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab).toHaveAttribute('aria-selected', 'false')
    })
  })

  it('does not select any tab when all tabs are disabled', async () => {
    render(createTabsApp(`
      <TabsRoot>
        <TabsList>
          <TabsTab :value="0" disabled>Tab 0</TabsTab>
          <TabsTab :value="1" disabled>Tab 1</TabsTab>
        </TabsList>
        <TabsPanel :value="0" keep-mounted>Panel 0</TabsPanel>
        <TabsPanel :value="1" keep-mounted>Panel 1</TabsPanel>
      </TabsRoot>
    `))

    await waitFor(() => {
      screen.getAllByRole('tab').forEach((tab) => {
        expect(tab).toHaveAttribute('aria-selected', 'false')
      })
      screen.getAllByRole('tabpanel', { hidden: true }).forEach((panel) => {
        expect(panel).toHaveAttribute('hidden')
      })
    })
  })

  it('does not set tabIndex=0 on disabled tabs when they are programmatically selected', async () => {
    const selectedValue = ref(1)

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue">
          <TabsList>
            <TabsTab :value="0" disabled>Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ selectedValue }),
    ))

    await waitFor(() => {
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('tabindex', '0')
    })

    selectedValue.value = 0
    await flushTabs()

    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('tabindex', '-1')
    expect(tabs[1]).toHaveAttribute('tabindex', '0')
  })

  it('does not cancel automatic value changes', async () => {
    const handleValueChange = vi.fn((_value, details) => {
      details.cancel()
    })

    render(createTabsApp(
      `
        <TabsRoot @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" disabled>Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('initial')
      expect(handleValueChange.mock.calls[0][1].activationDirection).toBe('none')
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('does not move an uncontrolled selection when a user-initiated change is canceled', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn((_value, details) => {
      if (details.reason === 'none') {
        details.cancel()
      }
    })

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    const tabs = screen.getAllByRole('tab')
    await user.click(tabs[1])

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('does not change controlled value unless the parent updates it', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot value="overview" @value-change="handleValueChange">
          <TabsList>
            <TabsTab value="overview">Overview</TabsTab>
            <TabsTab value="projects">Projects</TabsTab>
          </TabsList>
          <TabsPanel value="overview">Overview panel</TabsPanel>
          <TabsPanel value="projects">Projects panel</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await user.click(screen.getByRole('tab', { name: 'Projects' }))

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(handleValueChange.mock.calls[0][0]).toBe('projects')
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('Projects panel')).not.toBeInTheDocument()
  })

  it('calls onValueChange when the selected tab becomes disabled', async () => {
    const disableFirst = ref(false)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" :disabled="disableFirst">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ disableFirst, handleValueChange }),
    ))

    disableFirst.value = true
    await flushTabs()

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('disabled')
      expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange when an explicit disabled default becomes disabled again', async () => {
    const disableFirst = ref(true)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" :disabled="disableFirst">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ disableFirst, handleValueChange }),
    ))

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')

    disableFirst.value = false
    await flushTabs()

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')

    disableFirst.value = true
    await flushTabs()

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('disabled')
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('calls onValueChange when the selected tab becomes disabled with keepMounted panels', async () => {
    const disableFirst = ref(false)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" :disabled="disableFirst">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
          <TabsPanel :value="0" keep-mounted>Panel 0</TabsPanel>
          <TabsPanel :value="1" keep-mounted>Panel 1</TabsPanel>
        </TabsRoot>
      `,
      () => ({ disableFirst, handleValueChange }),
    ))

    disableFirst.value = true
    await flushTabs()

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('disabled')
    })

    const panels = screen.getAllByRole('tabpanel', { hidden: true })
    expect(panels[0]).toHaveAttribute('hidden')
    expect(panels[1]).not.toHaveAttribute('hidden')
  })

  it('calls onValueChange when the selected tab is removed', async () => {
    const showFirstTab = ref(true)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab v-if="showFirstTab" :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange, showFirstTab }),
    ))

    showFirstTab.value = false
    await flushTabs()

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('missing')
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
      expect(screen.getAllByRole('tab')[0]).toHaveTextContent('Tab 1')
    })
  })

  it('calls onValueChange with null when the selected tab is removed and no tabs remain', async () => {
    const showTab = ref(true)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab v-if="showTab" :value="0">Tab 0</TabsTab>
          </TabsList>
          <TabsPanel :value="0" keep-mounted>Panel 0</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange, showTab }),
    ))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Tab 0' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByRole('tabpanel')).not.toHaveAttribute('hidden')
    })

    showTab.value = false
    await flushTabs()

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(null)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('missing')
      expect(screen.queryAllByRole('tab')).toHaveLength(0)
      expect(screen.getByRole('tabpanel', { hidden: true })).toHaveAttribute('hidden')
    })
  })

  it('calls onValueChange when an explicit defaultValue points at a tab that is never present', async () => {
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toBe(1)
      expect(handleValueChange.mock.calls[0][1].reason).toBe('missing')
      expect(screen.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('does not fall back when the tab map empties while the tab stays connected', async () => {
    const user = userEvent.setup()
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
          </TabsList>
          <ConnectedMapCleanupProbe />
        </TabsRoot>
      `,
      () => ({ handleValueChange }),
    ))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Tab 0' })).toHaveAttribute('aria-selected', 'true')
    })

    handleValueChange.mockClear()

    await user.click(screen.getByRole('button', { name: 'Clear tab map' }))
    await flushTabs()

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tab', { name: 'Tab 0' })).toHaveAttribute('aria-selected', 'true')
  })

  it('does not call onValueChange when a controlled selected tab becomes disabled', async () => {
    const disableFirst = ref(false)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0" :disabled="disableFirst">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ disableFirst, handleValueChange }),
    ))

    disableFirst.value = true
    await flushTabs()

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tab', { name: 'Tab 0' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false')
  })

  it('does not call onValueChange when a controlled selected tab is removed', async () => {
    const showFirstTab = ref(true)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="0" @value-change="handleValueChange">
          <TabsList>
            <TabsTab v-if="showFirstTab" :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleValueChange, showFirstTab }),
    ))

    showFirstTab.value = false
    await flushTabs()

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'false')
  })

  it('sets orientation attributes on the root and list', () => {
    render(createTabsApp(`
      <TabsRoot :value="0" orientation="vertical" data-testid="root">
        <TabsList data-testid="list">
          <TabsTab :value="0">Tab 0</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'vertical')
    expect(screen.getByTestId('list')).toHaveAttribute('aria-orientation', 'vertical')
    expect(screen.getByTestId('list')).toHaveAttribute('data-orientation', 'vertical')
  })

  it('should set the `data-activation-direction` attribute on the tabs root with orientation=horizontal', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot data-testid="root">
        <TabsList>
          <TabsTab :value="0">Tab 0</TabsTab>
          <TabsTab :value="1">Tab 1</TabsTab>
        </TabsList>
        <TabsPanel :value="0" :as="Slot" v-slot="{ props, ref, state }">
          <div v-bind="props" :ref="ref" data-testid="panel-0" :data-panel-direction="state.tabActivationDirection" />
        </TabsPanel>
        <TabsPanel :value="1" :as="Slot" v-slot="{ props, ref, state }">
          <div v-bind="props" :ref="ref" data-testid="panel-1" :data-panel-direction="state.tabActivationDirection" />
        </TabsPanel>
      </TabsRoot>
    `))

    const [tab1, tab2] = screen.getAllByRole('tab')
    vi.spyOn(tab1, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 0,
      width: 80,
      height: 32,
    }))
    vi.spyOn(tab2, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 100,
      top: 0,
      width: 80,
      height: 32,
    }))

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'none')

    await user.click(tab2)

    expect(screen.getByTestId('panel-1')).toHaveAttribute('data-panel-direction', 'right')
    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'right')

    await user.click(tab1)

    expect(screen.getByTestId('panel-0')).toHaveAttribute('data-panel-direction', 'left')
    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'left')
  })

  it('should set the `data-activation-direction` attribute on the tabs root with orientation=vertical', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="a" orientation="vertical" data-testid="root">
        <TabsList data-testid="list">
          <TabsTab value="a">A</TabsTab>
          <TabsTab value="b">B</TabsTab>
        </TabsList>
        <TabsPanel value="a">Panel A</TabsPanel>
        <TabsPanel value="b">Panel B</TabsPanel>
      </TabsRoot>
    `))

    const tabA = screen.getByRole('tab', { name: 'A' })
    const tabB = screen.getByRole('tab', { name: 'B' })

    vi.spyOn(tabA, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 0,
      width: 80,
      height: 32,
    }))
    vi.spyOn(tabB, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 40,
      width: 80,
      height: 32,
    }))

    await user.click(tabB)

    expect(screen.getByTestId('root')).toHaveAttribute('data-orientation', 'vertical')
    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'down')
    expect(screen.getByTestId('list')).toHaveAttribute('data-orientation', 'vertical')
    expect(tabB).toHaveAttribute('data-active')
  })

  it('should update `data-activation-direction` on programmatic value changes with orientation=horizontal', async () => {
    const selectedValue = ref(0)

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue" data-testid="root">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
          <TabsPanel :value="0">Panel 0</TabsPanel>
          <TabsPanel :value="1">Panel 1</TabsPanel>
        </TabsRoot>
      `,
      () => ({ selectedValue }),
    ))

    const [tab1, tab2] = screen.getAllByRole('tab')
    vi.spyOn(tab1, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 0,
      width: 80,
      height: 32,
    }))
    vi.spyOn(tab2, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 100,
      top: 0,
      width: 80,
      height: 32,
    }))

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'none')
    expect(tab1).toHaveAttribute('data-activation-direction', 'none')

    selectedValue.value = 1
    await flushTabs()

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'right')
    expect(tab2).toHaveAttribute('data-activation-direction', 'right')

    selectedValue.value = 0
    await flushTabs()

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'left')
    expect(tab1).toHaveAttribute('data-activation-direction', 'left')
  })

  it('should update `data-activation-direction` on programmatic value changes with orientation=vertical', async () => {
    const selectedValue = ref(0)

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue" data-testid="root" orientation="vertical">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
          <TabsPanel :value="0">Panel 0</TabsPanel>
          <TabsPanel :value="1">Panel 1</TabsPanel>
        </TabsRoot>
      `,
      () => ({ selectedValue }),
    ))

    const [tab1, tab2] = screen.getAllByRole('tab')
    vi.spyOn(tab1, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 0,
      width: 80,
      height: 32,
    }))
    vi.spyOn(tab2, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 40,
      width: 80,
      height: 32,
    }))

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'none')
    expect(tab1).toHaveAttribute('data-activation-direction', 'none')

    selectedValue.value = 1
    await flushTabs()

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'down')
    expect(tab2).toHaveAttribute('data-activation-direction', 'down')

    selectedValue.value = 0
    await flushTabs()

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'up')
    expect(tab1).toHaveAttribute('data-activation-direction', 'up')
  })

  it('keeps activation direction none after automatic disabled fallback', async () => {
    const disableFirst = ref(false)

    render(createTabsApp(
      `
        <TabsRoot :default-value="0" data-testid="root">
          <TabsList>
            <TabsTab :value="0" :disabled="disableFirst">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
          <TabsPanel :value="0">Panel 0</TabsPanel>
          <TabsPanel :value="1">Panel 1</TabsPanel>
        </TabsRoot>
      `,
      () => ({ disableFirst }),
    ))

    disableFirst.value = true
    await flushTabs()

    await waitFor(() => {
      expect(screen.getAllByRole('tab')[1]).toHaveAttribute('aria-selected', 'true')
    })
    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'none')
  })

  it('should update `data-activation-direction` on programmatic change after a canceled click', async () => {
    const user = userEvent.setup()
    const selectedValue = ref(0)
    const handleValueChange = vi.fn((_value, details) => {
      details.cancel()
    })

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue" data-testid="root" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
          <TabsPanel :value="0">Panel 0</TabsPanel>
          <TabsPanel :value="1">Panel 1</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange, selectedValue }),
    ))

    const root = screen.getByTestId('root')
    const [tab1, tab2] = screen.getAllByRole('tab')
    vi.spyOn(tab1, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 0,
      width: 80,
      height: 32,
    }))
    vi.spyOn(tab2, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 100,
      top: 0,
      width: 80,
      height: 32,
    }))

    await user.click(tab2)
    expect(root).toHaveAttribute('data-activation-direction', 'none')

    selectedValue.value = 1
    await flushTabs()

    expect(root).toHaveAttribute('data-activation-direction', 'right')
  })

  it('should update `data-activation-direction` on programmatic change after a controlled parent ignores click', async () => {
    const user = userEvent.setup()
    const selectedValue = ref(0)
    const handleValueChange = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue" data-testid="root" @value-change="handleValueChange">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
          <TabsPanel :value="0">Panel 0</TabsPanel>
          <TabsPanel :value="1">Panel 1</TabsPanel>
        </TabsRoot>
      `,
      () => ({ handleValueChange, selectedValue }),
    ))

    const root = screen.getByTestId('root')
    const [tab1, tab2] = screen.getAllByRole('tab')
    vi.spyOn(tab1, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 0,
      top: 0,
      width: 80,
      height: 32,
    }))
    vi.spyOn(tab2, 'getBoundingClientRect').mockReturnValue(createRect({
      left: 100,
      top: 0,
      width: 80,
      height: 32,
    }))

    await user.click(tab2)

    selectedValue.value = 1
    await flushTabs()

    expect(handleValueChange).toHaveBeenCalledTimes(1)
    expect(root).toHaveAttribute('data-activation-direction', 'right')
  })

  it('should compute correct direction when adding and selecting a new tab in one controlled update', async () => {
    const user = userEvent.setup()
    const tabs = ref([0, 1])
    const selectedValue = ref(0)

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRect(this: HTMLElement) {
      const text = this.textContent?.trim()
      if (text === 'Tab 0') {
        return createRect({ left: 0, top: 0, width: 80, height: 32 })
      }
      if (text === 'Tab 1') {
        return createRect({ left: 100, top: 0, width: 80, height: 32 })
      }
      if (text === 'Tab 2') {
        return createRect({ left: 200, top: 0, width: 80, height: 32 })
      }
      return createRect({ left: 0, top: 0, width: 0, height: 0 })
    })

    render(createTabsApp(
      `
        <button
          type="button"
          @click="tabs = [0, 1, 2]; selectedValue = 2"
        >
          Add and Select
        </button>
        <TabsRoot :value="selectedValue" data-testid="root">
          <TabsList>
            <TabsTab v-for="tab in tabs" :key="tab" :value="tab">
              Tab {{ tab }}
            </TabsTab>
          </TabsList>
          <TabsPanel v-for="tab in tabs" :key="tab" :value="tab">
            Panel {{ tab }}
          </TabsPanel>
        </TabsRoot>
      `,
      () => ({ selectedValue, tabs }),
    ))

    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'none')

    await user.click(screen.getByRole('button', { name: 'Add and Select' }))
    await flushTabs()

    expect(screen.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'right')
  })

  it('should compute correct direction on final render when adding and selecting a new tab in one controlled update with out of order string values', async () => {
    const selectedValue = ref('b')
    const showA = ref(false)

    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function mockRect(this: HTMLElement) {
      const text = this.textContent?.trim()
      if (text === 'B') {
        return createRect({ left: 0, top: 0, width: 80, height: 32 })
      }
      if (text === 'A') {
        return createRect({ left: 100, top: 0, width: 80, height: 32 })
      }
      return createRect({ left: 0, top: 0, width: 0, height: 0 })
    })

    render(createTabsApp(
      `
        <TabsRoot :value="selectedValue" data-testid="root">
          <TabsList>
            <TabsTab value="b">B</TabsTab>
            <TabsTab v-if="showA" value="a">A</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ selectedValue, showA }),
    ))

    await flushTabs()
    selectedValue.value = 'a'
    showA.value = true
    await flushTabs()

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute('aria-selected', 'true')
      expect(screen.getByTestId('root')).toHaveAttribute('data-activation-direction', 'right')
    })
  })
})
