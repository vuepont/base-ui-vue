import userEvent from '@testing-library/user-event'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { Slot } from '../utils/slot'
import { Button } from './index'

describe('<Button />', () => {
  describe('prop: disabled', () => {
    it('native button: uses the disabled attribute and is not focusable', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      const handleMousedown = vi.fn()
      const handlePointerDown = vi.fn()
      const handleKeyDown = vi.fn()

      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
        attrs: {
          onClick: handleClick,
          onMousedown: handleMousedown,
          onPointerDown: handlePointerDown,
          onKeydown: handleKeyDown,
        },
        attachTo: document.body,
      })

      const button = wrapper.element as HTMLButtonElement

      expect(button.hasAttribute('disabled')).toBe(true)
      expect(button.hasAttribute('data-disabled')).toBe(true)
      expect(button.hasAttribute('aria-disabled')).toBe(false)

      await user.tab()
      expect(document.activeElement).not.toBe(button)

      await user.click(button)
      await user.keyboard('[Space]')
      await user.keyboard('[Enter]')

      expect(handleClick).not.toHaveBeenCalled()
      expect(handleMousedown).not.toHaveBeenCalled()
      expect(handlePointerDown).not.toHaveBeenCalled()
      expect(handleKeyDown).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('custom element: applies aria-disabled and is not focusable', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      const wrapper = mount(Button, {
        props: {
          disabled: true,
          as: 'span',
        },
        attrs: {
          onClick: handleClick,
        },
        attachTo: document.body,
      })

      const button = wrapper.element as HTMLElement

      expect(button.hasAttribute('disabled')).toBe(false)
      expect(button.hasAttribute('data-disabled')).toBe(true)
      expect(button.getAttribute('aria-disabled')).toBe('true')
      expect(button.getAttribute('tabindex')).toBe('-1')

      await user.tab()
      expect(document.activeElement).not.toBe(button)

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()

      wrapper.unmount()
    })
  })

  describe('prop: focusableWhenDisabled', () => {
    it('native button: prevents interactions but remains focusable', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      const wrapper = mount(Button, {
        props: {
          disabled: true,
          focusableWhenDisabled: true,
        },
        attrs: {
          onClick: handleClick,
        },
        attachTo: document.body,
      })

      const button = wrapper.element as HTMLButtonElement

      // When focusableWhenDisabled is true, we should NOT use the native disabled attribute
      // because that makes it non-focusable.
      expect(button.hasAttribute('disabled')).toBe(false)
      expect(button.hasAttribute('data-disabled')).toBe(true)
      expect(button.getAttribute('aria-disabled')).toBe('true')
      expect(button.getAttribute('tabindex')).toBe('0')

      await user.tab()
      expect(document.activeElement).toBe(button)

      await user.click(button)
      await user.keyboard('[Space]')
      await user.keyboard('[Enter]')

      expect(handleClick).not.toHaveBeenCalled()

      wrapper.unmount()
    })

    it('custom element: prevents interactions but remains focusable', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()

      const wrapper = mount(Button, {
        props: {
          disabled: true,
          focusableWhenDisabled: true,
          as: 'span',
        },
        attrs: {
          onClick: handleClick,
        },
        attachTo: document.body,
      })

      const button = wrapper.element as HTMLElement

      expect(button.hasAttribute('disabled')).toBe(false)
      expect(button.hasAttribute('data-disabled')).toBe(true)
      expect(button.getAttribute('aria-disabled')).toBe('true')
      expect(button.getAttribute('tabindex')).toBe('0')

      await user.tab()
      expect(document.activeElement).toBe(button)

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()

      wrapper.unmount()
    })
  })

  it('supports renderless mode and forwards the internal ref callback', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    const TestComponent = defineComponent({
      components: { Button },
      setup() {
        return { Slot, handleClick }
      },
      template: `
        <Button
          :as="Slot"
          :disabled="true"
          :focusable-when-disabled="true"
          v-slot="{ props, state, ref }"
        >
          <span v-bind="props" :ref="ref" data-testid="renderless-button">
            {{ state.disabled ? 'disabled' : 'enabled' }}
          </span>
        </Button>
      `,
    })

    const wrapper = mount(TestComponent, {
      attrs: {
        onClick: handleClick,
      },
      attachTo: document.body,
    })

    const button = wrapper.get('[data-testid="renderless-button"]')
      .element as HTMLElement

    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(button.getAttribute('tabindex')).toBe('0')
    expect(button.textContent).toBe('disabled')

    await user.click(button)
    expect(handleClick).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
