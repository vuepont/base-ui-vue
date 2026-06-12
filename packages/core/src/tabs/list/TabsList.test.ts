import type { TextDirection } from '../../direction-provider'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { DirectionProvider } from '../../direction-provider'
import TabsPanel from '../panel/TabsPanel.vue'
import TabsRoot from '../root/TabsRoot.vue'
import TabsTab from '../tab/TabsTab.vue'
import TabsList from './TabsList.vue'

function createTabsApp(template: string, setup?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      DirectionProvider,
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

function createKeyboardTabsApp(options: {
  activateOnFocus?: boolean
  direction?: TextDirection
  disabledFirst?: boolean
  disabledMiddle?: boolean
  handleChange?: (...args: any[]) => void
  handleKeyDown?: (event: KeyboardEvent) => void
  orientation?: 'horizontal' | 'vertical'
  value?: number | null
}) {
  const {
    activateOnFocus = false,
    direction = 'ltr',
    disabledFirst = false,
    disabledMiddle = false,
    handleChange = vi.fn(),
    handleKeyDown = vi.fn(),
    orientation = 'horizontal',
    value = 0,
  } = options

  return createTabsApp(
    `
      <DirectionProvider :direction="direction">
        <TabsRoot
          :orientation="orientation"
          :value="value"
          @value-change="handleChange"
        >
          <TabsList
            :activate-on-focus="activateOnFocus"
            @keydown="handleKeyDown"
          >
            <TabsTab :value="0" :disabled="disabledFirst">Tab 0</TabsTab>
            <TabsTab :value="1" :disabled="disabledMiddle">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      </DirectionProvider>
    `,
    () => ({
      activateOnFocus,
      direction,
      disabledFirst,
      disabledMiddle,
      handleChange,
      handleKeyDown,
      orientation,
      value,
    }),
  )
}

describe('<TabsList />', () => {
  it('sets the aria-selected attribute on the active tab', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot :default-value="1">
        <TabsList>
          <TabsTab :value="1">Tab 1</TabsTab>
          <TabsTab :value="2">Tab 2</TabsTab>
          <TabsTab :value="3">Tab 3</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const tab1 = screen.getByText('Tab 1')
    const tab2 = screen.getByText('Tab 2')
    const tab3 = screen.getByText('Tab 3')

    expect(tab1).toHaveAttribute('aria-selected', 'true')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab3).toHaveAttribute('aria-selected', 'false')

    await user.click(tab2)

    expect(tab1).toHaveAttribute('aria-selected', 'false')
    expect(tab2).toHaveAttribute('aria-selected', 'true')
    expect(tab3).toHaveAttribute('aria-selected', 'false')

    await user.click(tab3)

    expect(tab1).toHaveAttribute('aria-selected', 'false')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab3).toHaveAttribute('aria-selected', 'true')

    await user.click(tab1)

    expect(tab1).toHaveAttribute('aria-selected', 'true')
    expect(tab2).toHaveAttribute('aria-selected', 'false')
    expect(tab3).toHaveAttribute('aria-selected', 'false')
  })

  it('does not wrap focus past the first tab when `loopFocus` is false', async () => {
    render(createTabsApp(`
      <TabsRoot :value="0">
        <TabsList :loop-focus="false">
          <TabsTab :value="0">Zero</TabsTab>
          <TabsTab :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const [firstTab, , lastTab] = screen.getAllByRole('tab')
    firstTab.focus()
    await fireEvent.keyDown(firstTab, { key: 'ArrowLeft' })
    await flushTabs()

    expect(firstTab).toHaveFocus()
    expect(lastTab).not.toHaveFocus()
  })

  it('does not wrap focus past the last tab when `loopFocus` is false', async () => {
    render(createTabsApp(`
      <TabsRoot :value="2">
        <TabsList :loop-focus="false">
          <TabsTab :value="0">Zero</TabsTab>
          <TabsTab :value="1">One</TabsTab>
          <TabsTab :value="2">Two</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    const [firstTab, , lastTab] = screen.getAllByRole('tab')
    lastTab.focus()
    await fireEvent.keyDown(lastTab, { key: 'ArrowRight' })
    await flushTabs()

    expect(lastTab).toHaveFocus()
    expect(firstTab).not.toHaveFocus()
  })

  it('can be named via `aria-label`', () => {
    render(createTabsApp(`
      <TabsRoot :default-value="0">
        <TabsList aria-label="string label">
          <TabsTab :value="0">A</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    expect(screen.getByRole('tablist', { name: 'string label' })).toBeInTheDocument()
  })

  it('can be named via `aria-labelledby`', () => {
    render(createTabsApp(`
      <section>
        <h3 id="label-id">complex name</h3>
        <TabsRoot :default-value="0">
          <TabsList aria-labelledby="label-id">
            <TabsTab :value="0">A</TabsTab>
          </TabsList>
        </TabsRoot>
      </section>
    `))

    expect(screen.getByRole('tablist', { name: 'complex name' })).toBeInTheDocument()
  })

  it('does not add aria-orientation by default', () => {
    render(createTabsApp(`
      <TabsRoot orientation="horizontal">
        <TabsList>
          <TabsTab :value="0">A</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    expect(screen.getByRole('tablist')).not.toHaveAttribute('aria-orientation')
  })

  it('adds the proper aria-orientation when vertical', () => {
    render(createTabsApp(`
      <TabsRoot orientation="vertical">
        <TabsList>
          <TabsTab :value="0">A</TabsTab>
        </TabsList>
      </TabsRoot>
    `))

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('activates focused tabs during keyboard navigation when activate-on-focus is set', async () => {
    const user = userEvent.setup()

    render(createTabsApp(`
      <TabsRoot default-value="overview">
        <TabsList activate-on-focus>
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="projects">Projects</TabsTab>
        </TabsList>
        <TabsPanel value="overview">Overview panel</TabsPanel>
        <TabsPanel value="projects">Projects panel</TabsPanel>
      </TabsRoot>
    `))

    screen.getByRole('tab', { name: 'Overview' }).focus()
    await user.keyboard('{ArrowRight}')

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Projects' })).toHaveFocus()
      expect(screen.getByRole('tab', { name: 'Projects' })).toHaveAttribute('aria-selected', 'true')
    })
  })

  it('when `activateOnFocus = true` should call onValueChange on pointerdown', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const handlePointerDown = vi.fn()

    render(createTabsApp(
      `
        <TabsRoot :value="0" @value-change="handleChange">
          <TabsList activate-on-focus>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1" @pointerdown="handlePointerDown">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ handleChange, handlePointerDown }),
    ))

    await user.pointer({ keys: '[MouseLeft>]', target: screen.getAllByRole('tab')[1] })
    await flushTabs()

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handlePointerDown).toHaveBeenCalledTimes(1)
  })

  it('when `activateOnFocus = true` should call onValueChange if an unactive tab gets focused', async () => {
    const handleChange = vi.fn()

    render(createKeyboardTabsApp({
      activateOnFocus: true,
      handleChange,
      value: 0,
    }))
    await flushTabs()

    const [firstTab] = screen.getAllByRole('tab')
    firstTab.focus()

    await fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    await flushTabs()

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange.mock.calls[0][0]).toBe(1)
  })

  it('when `activateOnFocus = false` should not call onValueChange if an unactive tab gets focused', async () => {
    const handleChange = vi.fn()

    render(createKeyboardTabsApp({
      activateOnFocus: false,
      handleChange,
      value: 1,
    }))
    await flushTabs()

    const [firstTab] = screen.getAllByRole('tab')
    firstTab.focus()
    await flushTabs()

    expect(handleChange).not.toHaveBeenCalled()
  })

  describe('keyboard navigation when focus is on a tab', () => {
    it('moves focus to the last tab without activating it if focus is on the first tab', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 0 }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      firstTab.focus()
      await fireEvent.keyDown(firstTab, { key: 'ArrowLeft' })
      await flushTabs()

      expect(lastTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the previous tab without activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 1 }))
      await flushTabs()

      const [firstTab, secondTab] = screen.getAllByRole('tab')
      secondTab.focus()
      await fireEvent.keyDown(secondTab, { key: 'ArrowLeft' })
      await flushTabs()

      expect(firstTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to a disabled tab without activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        disabledMiddle: true,
        handleChange,
        handleKeyDown,
        value: 2,
      }))
      await flushTabs()

      const [, disabledTab, lastTab] = screen.getAllByRole('tab')
      lastTab.focus()
      await fireEvent.keyDown(lastTab, { key: 'ArrowLeft' })
      await flushTabs()

      expect(disabledTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the last tab while activating it if focus is on the first tab', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        activateOnFocus: true,
        handleChange,
        handleKeyDown,
        value: 0,
      }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      firstTab.focus()
      await fireEvent.keyDown(firstTab, { key: 'ArrowLeft' })
      await flushTabs()

      expect(lastTab).toHaveFocus()
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe(2)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the previous tab while activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        activateOnFocus: true,
        handleChange,
        handleKeyDown,
        value: 1,
      }))
      await flushTabs()

      const [firstTab, secondTab] = screen.getAllByRole('tab')
      secondTab.focus()
      await fireEvent.keyDown(secondTab, { key: 'ArrowLeft' })
      await flushTabs()

      expect(firstTab).toHaveFocus()
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe(0)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the first tab without activating it if focus is on the last tab', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 2 }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      lastTab.focus()
      await fireEvent.keyDown(lastTab, { key: 'ArrowRight' })
      await flushTabs()

      expect(firstTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the next tab without activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 1 }))
      await flushTabs()

      const [, secondTab, lastTab] = screen.getAllByRole('tab')
      secondTab.focus()
      await fireEvent.keyDown(secondTab, { key: 'ArrowRight' })
      await flushTabs()

      expect(lastTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the first tab while activating it if focus is on the last tab', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        activateOnFocus: true,
        handleChange,
        handleKeyDown,
        value: 2,
      }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      lastTab.focus()
      await fireEvent.keyDown(lastTab, { key: 'ArrowRight' })
      await flushTabs()

      expect(firstTab).toHaveFocus()
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe(0)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('moves focus to the next tab while activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        activateOnFocus: true,
        handleChange,
        handleKeyDown,
        value: 1,
      }))
      await flushTabs()

      const [, secondTab, lastTab] = screen.getAllByRole('tab')
      secondTab.focus()
      await fireEvent.keyDown(secondTab, { key: 'ArrowRight' })
      await flushTabs()

      expect(lastTab).toHaveFocus()
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe(2)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    describe('vertical orientation', () => {
      it('moves focus to the previous tab without activating it', async () => {
        const handleChange = vi.fn()
        const handleKeyDown = vi.fn()

        render(createKeyboardTabsApp({
          handleChange,
          handleKeyDown,
          orientation: 'vertical',
          value: 1,
        }))
        await flushTabs()

        const [firstTab, secondTab] = screen.getAllByRole('tab')
        secondTab.focus()
        await fireEvent.keyDown(secondTab, { key: 'ArrowUp' })
        await flushTabs()

        expect(firstTab).toHaveFocus()
        expect(handleChange).not.toHaveBeenCalled()
        expect(handleKeyDown).toHaveBeenCalledTimes(1)
        expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
      })

      it('moves focus to the next tab without activating it', async () => {
        const handleChange = vi.fn()
        const handleKeyDown = vi.fn()

        render(createKeyboardTabsApp({
          handleChange,
          handleKeyDown,
          orientation: 'vertical',
          value: 1,
        }))
        await flushTabs()

        const [, secondTab, lastTab] = screen.getAllByRole('tab')
        secondTab.focus()
        await fireEvent.keyDown(secondTab, { key: 'ArrowDown' })
        await flushTabs()

        expect(lastTab).toHaveFocus()
        expect(handleChange).not.toHaveBeenCalled()
        expect(handleKeyDown).toHaveBeenCalledTimes(1)
        expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
      })
    })

    describe('rtl direction', () => {
      it('moves focus to the previous tab without activating it', async () => {
        const handleChange = vi.fn()
        const handleKeyDown = vi.fn()

        render(createKeyboardTabsApp({
          direction: 'rtl',
          handleChange,
          handleKeyDown,
          value: 1,
        }))
        await flushTabs()

        const [firstTab, secondTab] = screen.getAllByRole('tab')
        secondTab.focus()
        await fireEvent.keyDown(secondTab, { key: 'ArrowRight' })
        await flushTabs()

        expect(firstTab).toHaveFocus()
        expect(handleChange).not.toHaveBeenCalled()
        expect(handleKeyDown).toHaveBeenCalledTimes(1)
        expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
      })

      it('moves focus to the next tab without activating it', async () => {
        const handleChange = vi.fn()
        const handleKeyDown = vi.fn()

        render(createKeyboardTabsApp({
          direction: 'rtl',
          handleChange,
          handleKeyDown,
          value: 1,
        }))
        await flushTabs()

        const [, secondTab, lastTab] = screen.getAllByRole('tab')
        secondTab.focus()
        await fireEvent.keyDown(secondTab, { key: 'ArrowLeft' })
        await flushTabs()

        expect(lastTab).toHaveFocus()
        expect(handleChange).not.toHaveBeenCalled()
        expect(handleKeyDown).toHaveBeenCalledTimes(1)
        expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
      })
    })

    ;['Shift', 'Control', 'Alt', 'Meta'].forEach((modifierKey) => {
      it(`does not move focus when modifier key: ${modifierKey} is pressed`, async () => {
        const handleChange = vi.fn()
        const handleKeyDown = vi.fn()

        render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 0 }))
        await flushTabs()

        const [firstTab] = screen.getAllByRole('tab')
        firstTab.focus()

        await fireEvent.keyDown(firstTab, {
          key: 'ArrowRight',
          [modifierKey === 'Control' ? 'ctrlKey' : `${modifierKey.toLowerCase()}Key`]: true,
        })
        await flushTabs()

        expect(firstTab).toHaveFocus()
        expect(handleChange).not.toHaveBeenCalled()
        expect(handleKeyDown).toHaveBeenCalledTimes(1)
      })
    })

    it('when `activateOnFocus = false`, moves focus to the first tab without activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 2 }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      lastTab.focus()
      await fireEvent.keyDown(lastTab, { key: 'Home' })
      await flushTabs()

      expect(firstTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('when `activateOnFocus = true`, moves focus to the first tab while activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        activateOnFocus: true,
        handleChange,
        handleKeyDown,
        value: 2,
      }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      lastTab.focus()
      await fireEvent.keyDown(lastTab, { key: 'Home' })
      await flushTabs()

      expect(firstTab).toHaveFocus()
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe(0)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    ;[false, true].forEach((activateOnFocus) => {
      it(`when \`activateOnFocus = ${activateOnFocus}\`, moves focus to a disabled tab without activating it`, async () => {
        const handleChange = vi.fn()
        const handleKeyDown = vi.fn()

        render(createKeyboardTabsApp({
          activateOnFocus,
          disabledFirst: true,
          handleChange,
          handleKeyDown,
          value: 2,
        }))
        await flushTabs()

        const [disabledTab, , lastTab] = screen.getAllByRole('tab')
        lastTab.focus()
        await fireEvent.keyDown(lastTab, { key: 'Home' })
        await flushTabs()

        expect(disabledTab).toHaveFocus()
        expect(handleChange).not.toHaveBeenCalled()
        expect(handleKeyDown).toHaveBeenCalledTimes(1)
        expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
      })
    })

    it('when `activateOnFocus = false`, moves focus to the last tab without activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({ handleChange, handleKeyDown, value: 0 }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      firstTab.focus()
      await fireEvent.keyDown(firstTab, { key: 'End' })
      await flushTabs()

      expect(lastTab).toHaveFocus()
      expect(handleChange).not.toHaveBeenCalled()
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('when `activateOnFocus = true`, moves focus to the last tab while activating it', async () => {
      const handleChange = vi.fn()
      const handleKeyDown = vi.fn()

      render(createKeyboardTabsApp({
        activateOnFocus: true,
        handleChange,
        handleKeyDown,
        value: 0,
      }))
      await flushTabs()

      const [firstTab, , lastTab] = screen.getAllByRole('tab')
      firstTab.focus()
      await fireEvent.keyDown(firstTab, { key: 'End' })
      await flushTabs()

      expect(lastTab).toHaveFocus()
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toBe(2)
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(handleKeyDown.mock.calls[0][0]).toHaveProperty('defaultPrevented', true)
    })

    it('should allow to focus first tab when there are no active tabs', async () => {
      render(createTabsApp(`
        <TabsRoot :default-value="null">
          <TabsList>
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
          </TabsList>
        </TabsRoot>
      `))
      await flushTabs()

      expect(screen.getAllByRole('tab').map(tab => tab.getAttribute('tabindex'))).toEqual([
        '0',
        '-1',
      ])
    })
  })

  it('when focus is outside the tablist, highlight follows the new active tab (tabIndex=0 moves)', async () => {
    const activeValue = ref(0)

    render(createTabsApp(
      `
        <TabsRoot :value="activeValue">
          <TabsList :activate-on-focus="false">
            <TabsTab :value="0">Tab 0</TabsTab>
            <TabsTab :value="1">Tab 1</TabsTab>
            <TabsTab :value="2">Tab 2</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ activeValue }),
    ))
    await flushTabs()

    const [firstTab, secondTab, thirdTab] = screen.getAllByRole('tab')
    expect(firstTab.tabIndex).toBe(0)

    activeValue.value = 2
    await flushTabs()

    expect(firstTab.tabIndex).toBe(-1)
    expect(secondTab.tabIndex).toBe(-1)
    expect(thirdTab.tabIndex).toBe(0)

    activeValue.value = 1
    await flushTabs()

    expect(firstTab.tabIndex).toBe(-1)
    expect(secondTab.tabIndex).toBe(0)
    expect(thirdTab.tabIndex).toBe(-1)
  })

  it('when focus is inside the tablist, highlight stays put on external change and arrow keys continue from the focused tab', async () => {
    const activeValue = ref(0)

    render(createTabsApp(
      `
        <TabsRoot :value="activeValue">
          <TabsList :activate-on-focus="false">
            <TabsTab :value="0">Tab 1</TabsTab>
            <TabsTab :value="1">Tab 2</TabsTab>
            <TabsTab :value="2">Tab 3</TabsTab>
          </TabsList>
        </TabsRoot>
      `,
      () => ({ activeValue }),
    ))
    await flushTabs()

    const [firstTab, secondTab, thirdTab] = screen.getAllByRole('tab')
    firstTab.focus()
    expect(firstTab.tabIndex).toBe(0)

    activeValue.value = 2
    await flushTabs()

    expect(firstTab.tabIndex).toBe(0)
    expect(secondTab.tabIndex).toBe(-1)
    expect(thirdTab.tabIndex).toBe(-1)
    expect(firstTab).toHaveAttribute('aria-selected', 'false')
    expect(thirdTab).toHaveAttribute('aria-selected', 'true')

    await fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    await flushTabs()

    expect(secondTab).toHaveFocus()
    expect(thirdTab).toHaveAttribute('aria-selected', 'true')
    expect(secondTab).toHaveAttribute('aria-selected', 'false')
  })
})
