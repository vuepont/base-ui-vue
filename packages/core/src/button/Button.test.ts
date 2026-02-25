import userEvent from '@testing-library/user-event'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './index'

describe('<Button />', () => {
  describe('prop: disabled', () => {
    it('native button: uses the disabled attribute and is not focusable', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      const handleMousedown = vi.fn()

      const wrapper = mount(Button, {
        props: {
          disabled: true,
        },
        attrs: {
          onClick: handleClick,
          onMousedown: handleMousedown,
        },
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
    })
  })
})
