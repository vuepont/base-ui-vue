import userEvent from '@testing-library/user-event'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
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

  // TODO: Add composition coverage for rendering ToolbarButton as other Base UI
  // primitives once the Vue package has those companion components:
  // Switch, Menu, Select, Dialog, AlertDialog, Popover, Toggle, and ToggleGroup.
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
