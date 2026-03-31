import userEvent from '@testing-library/user-event'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { SwitchRoot, SwitchThumb } from '../../switch'
import { reset as resetErrors } from '../../utils/error'
import { ToolbarButton, ToolbarRoot } from '../index'

describe('<ToolbarButton />', () => {
  // TODO: Add shared public API contract coverage for ref exposure and
  // renderless/`as` behavior if the Vue package gains a reusable conformance
  // helper comparable to the React test harness.
  it('renders a button', () => {
    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarButton },
      template: `
        <ToolbarRoot>
          <ToolbarButton data-testid="button">Save</ToolbarButton>
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)

    expect(wrapper.get('[data-testid="button"]').element.tagName).toBe('BUTTON')
    expect(wrapper.get('[data-testid="button"]').attributes('type')).toBe('button')
  })

  describe('rendering other Base UI components', () => {
    describe('switch', () => {
      it('renders a switch', async () => {
        resetErrors()
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

        const TestComponent = defineComponent({
          components: { SwitchRoot, ToolbarButton, ToolbarRoot },
          template: `
            <ToolbarRoot>
              <ToolbarButton
                :as="SwitchRoot"
                data-testid="button"
              />
            </ToolbarRoot>
          `,
          setup() {
            return { SwitchRoot }
          },
        })

        const wrapper = mount(TestComponent)
        await nextTick()

        expect(consoleError).toHaveBeenCalledTimes(1)
        expect(consoleError.mock.calls[0]?.[0]).toContain(
          'A component that acts as a button expected a native <button>',
        )
        expect(wrapper.get('[data-testid="button"]').attributes('role')).toBe('switch')

        consoleError.mockRestore()
        wrapper.unmount()
      })

      it('handles interactions', async () => {
        resetErrors()
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const user = userEvent.setup()
        const handleCheckedChange = vi.fn()
        const handleClick = vi.fn()

        const TestComponent = defineComponent({
          components: { SwitchRoot, SwitchThumb, ToolbarButton, ToolbarRoot },
          setup() {
            return { SwitchRoot, handleCheckedChange, handleClick }
          },
          template: `
            <ToolbarRoot>
              <ToolbarButton
                :as="SwitchRoot"
                @checked-change="handleCheckedChange"
                @click="handleClick"
              >
                <SwitchThumb />
              </ToolbarButton>
            </ToolbarRoot>
          `,
        })

        const wrapper = mount(TestComponent, { attachTo: document.body })
        const switchElement = wrapper.get('[role="switch"]').element as HTMLElement

        expect(consoleError).toHaveBeenCalledTimes(1)
        expect(consoleError.mock.calls[0]?.[0]).toContain(
          'A component that acts as a button expected a native <button>',
        )
        expect(switchElement).toHaveAttribute('data-unchecked')

        await user.tab()
        expect(switchElement).toHaveAttribute('tabindex', '0')

        await user.click(switchElement)
        expect(handleCheckedChange).toHaveBeenCalledTimes(1)
        expect(handleClick).toHaveBeenCalledTimes(1)
        expect(switchElement).toHaveAttribute('data-checked')

        await user.keyboard('[Enter]')
        expect(handleCheckedChange).toHaveBeenCalledTimes(2)
        expect(handleClick).toHaveBeenCalledTimes(2)
        expect(switchElement).toHaveAttribute('data-unchecked')

        await user.keyboard('[Space]')
        expect(handleCheckedChange).toHaveBeenCalledTimes(3)
        expect(handleClick).toHaveBeenCalledTimes(3)
        expect(switchElement).toHaveAttribute('data-checked')

        consoleError.mockRestore()
        wrapper.unmount()
      })

      it('disabled state', async () => {
        resetErrors()
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        const user = userEvent.setup()
        const handleCheckedChange = vi.fn()
        const handleClick = vi.fn()

        const TestComponent = defineComponent({
          components: { SwitchRoot, ToolbarButton, ToolbarRoot },
          setup() {
            return { SwitchRoot, handleCheckedChange, handleClick }
          },
          template: `
            <ToolbarRoot>
              <ToolbarButton
                disabled
                :as="SwitchRoot"
                @checked-change="handleCheckedChange"
                @click="handleClick"
              />
            </ToolbarRoot>
          `,
        })

        const wrapper = mount(TestComponent, { attachTo: document.body })
        const switchElement = wrapper.get('[role="switch"]').element as HTMLElement

        expect(consoleError).toHaveBeenCalledTimes(1)
        expect(consoleError.mock.calls[0]?.[0]).toContain(
          'A component that acts as a button expected a native <button>',
        )
        expect(switchElement).not.toHaveAttribute('disabled')
        expect(switchElement).toHaveAttribute('data-disabled')
        expect(switchElement).toHaveAttribute('aria-disabled', 'true')

        await user.tab()
        expect(switchElement).toHaveAttribute('tabindex', '0')

        await user.keyboard('[Enter]')
        await user.keyboard('[Space]')
        await user.click(switchElement)

        expect(handleCheckedChange).not.toHaveBeenCalled()
        expect(handleClick).not.toHaveBeenCalled()

        consoleError.mockRestore()
        wrapper.unmount()
      })
    })
  })

  it('prevents interactions when disabled while remaining focusable by default', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    const handlePointerDown = vi.fn()

    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarButton },
      setup() {
        return { handleClick, handlePointerDown }
      },
      template: `
        <ToolbarRoot>
          <ToolbarButton disabled @click="handleClick" @pointerdown="handlePointerDown">
            Save
          </ToolbarButton>
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent, { attachTo: document.body })
    const button = wrapper.get('button').element as HTMLButtonElement

    expect(button.hasAttribute('disabled')).toBe(false)
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(button.getAttribute('data-disabled')).toBe('')
    expect(button.getAttribute('data-focusable')).toBe('')

    await user.tab()
    expect(document.activeElement).toBe(button)

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()
    expect(handlePointerDown).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('warns when nativeButton is true but the rendered element is not a button', async () => {
    resetErrors()
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const TestComponent = defineComponent({
      components: { ToolbarRoot, ToolbarButton },
      template: `
        <ToolbarRoot>
          <ToolbarButton as="span">Save</ToolbarButton>
        </ToolbarRoot>
      `,
    })

    const wrapper = mount(TestComponent)
    await nextTick()

    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError.mock.calls[0]?.[0]).toContain(
      'A component that acts as a button expected a native <button>',
    )

    consoleError.mockRestore()
    wrapper.unmount()
  })
})
