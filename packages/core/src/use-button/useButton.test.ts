import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { useMergedRefs } from '../../../plugins/src/useMergedRefs'
import { CompositeRoot } from '../composite/root'
import { useButton } from './useButton'

describe('useButton', () => {
  describe('non-native button', () => {
    describe('keyboard interactions', () => {
      ['Enter', 'Space'].forEach((key) => {
        it(`can be activated with ${key} key`, async () => {
          const clickSpy = vi.fn()

          const Button = defineComponent({
            setup() {
              const { getButtonProps, buttonRef } = useButton({
                native: false,
              })
              return { getButtonProps, buttonRef, clickSpy }
            },
            template: `<span ref="buttonRef" v-bind="getButtonProps({ onClick: clickSpy })" />`,
          })

          const user = userEvent.setup()
          render(Button)

          const button = screen.getByRole('button')

          await user.keyboard('[Tab]')
          expect(button).toHaveFocus()

          await user.keyboard(`[${key}]`)
          expect(clickSpy).toHaveBeenCalledTimes(1)
        })
      })
    })
  })

  describe('param: focusableWhenDisabled', () => {
    it('allows disabled buttons to be focused', async () => {
      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({
            disabled: true,
            focusableWhenDisabled: true,
          })
          return { getButtonProps, buttonRef }
        },
        template: `<button ref="buttonRef" v-bind="getButtonProps()" />`,
      })

      render(TestButton)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('force overrides disabled attribute when put in a composite', async () => {
      const TestButton = defineComponent({
        props: ['buttonKey'],
        setup() {
          const { getButtonProps, buttonRef } = useButton({
            disabled: true,
            focusableWhenDisabled: true,
          })
          return { getButtonProps, buttonRef }
        },
        template: `<button ref="buttonRef" :key="buttonKey" v-bind="getButtonProps({ disabled: true })" />`,
      })

      const Root = defineComponent({
        props: ['btnKey'],
        components: { TestButton, CompositeRoot },
        template: `<CompositeRoot><TestButton :buttonKey="btnKey" /></CompositeRoot>`,
      })

      const { rerender } = render(Root, { props: { btnKey: 'initial' } })

      // wait a tick for watchEffect to fire
      await new Promise(resolve => setTimeout(resolve, 0))

      async function verify() {
        const button = screen.getByRole('button')
        button.focus()
        expect(button).toHaveFocus()
      }

      await verify()

      await rerender({ btnKey: 'rerender' })
      await new Promise(resolve => setTimeout(resolve, 0))
      await verify()
    })

    it('prevents interactions except focus and blur', async () => {
      const handleClick = vi.fn()
      const handleKeydown = vi.fn()
      const handleKeyup = vi.fn()
      const handleFocus = vi.fn()
      const handleBlur = vi.fn()

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({
            disabled: true,
            focusableWhenDisabled: true,
            native: false,
          })
          return {
            getButtonProps,
            buttonRef,
            handleClick,
            handleKeydown,
            handleKeyup,
            handleFocus,
            handleBlur,
          }
        },
        template: `<span ref="buttonRef" v-bind="getButtonProps({
          onClick: handleClick,
          onKeydown: handleKeydown,
          onKeyup: handleKeyup,
          onFocus: handleFocus,
          onBlur: handleBlur,
        })" />`,
      })

      const user = userEvent.setup()
      render(TestButton)

      const button = screen.getByRole('button')
      expect(document.activeElement).not.toBe(button)

      expect(handleFocus).toHaveBeenCalledTimes(0)
      await user.keyboard('[Tab]')

      expect(button).toHaveFocus()
      expect(handleFocus).toHaveBeenCalledTimes(1)

      await user.keyboard('[Enter]')
      expect(handleKeydown).toHaveBeenCalledTimes(0)
      expect(handleClick).toHaveBeenCalledTimes(0)

      await user.keyboard('[Space]')
      expect(handleKeyup).toHaveBeenCalledTimes(0)
      expect(handleClick).toHaveBeenCalledTimes(0)

      await user.click(button)
      expect(handleKeydown).toHaveBeenCalledTimes(0)
      expect(handleKeyup).toHaveBeenCalledTimes(0)
      expect(handleClick).toHaveBeenCalledTimes(0)

      expect(handleBlur).toHaveBeenCalledTimes(0)
      await user.keyboard('[Tab]')
      expect(handleBlur).toHaveBeenCalledTimes(1)
      expect(document.activeElement).not.toBe(button)
    })
  })

  describe('param: tabIndex', () => {
    it('returns tabIndex in getButtonProps when host component is BUTTON', async () => {
      let emittedTabIndex: number | undefined

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton()
          emittedTabIndex = getButtonProps().tabIndex
          return { getButtonProps, buttonRef }
        },
        template: `<button ref="buttonRef" v-bind="getButtonProps()" />`,
      })

      render(TestButton)
      expect(emittedTabIndex).toBe(0)
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', 0)
    })

    it('returns tabIndex in getButtonProps when host component is not BUTTON', async () => {
      let emittedTabIndex: number | undefined

      const TestButton = defineComponent({
        setup() {
          const externalRef = ref<Element | null>(null)
          const { getButtonProps, buttonRef } = useButton({ native: false })
          emittedTabIndex = getButtonProps().tabIndex

          const mergedRef = useMergedRefs(externalRef, buttonRef)

          return { getButtonProps, mergedRef, externalRef }
        },
        template: `<span :ref="mergedRef" v-bind="getButtonProps()" />`,
      })

      render(TestButton)
      expect(emittedTabIndex).toBe(0)
      expect(screen.getByRole('button')).toHaveProperty('tabIndex', 0)
    })

    it('returns tabIndex in getButtonProps if it is explicitly provided', async () => {
      const customTabIndex = 3
      let emittedTabIndex: number | undefined

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({
            tabIndex: customTabIndex,
          })
          emittedTabIndex = getButtonProps().tabIndex
          return { getButtonProps, buttonRef }
        },
        template: `<button ref="buttonRef" v-bind="getButtonProps()" />`,
      })

      render(TestButton)
      expect(emittedTabIndex).toBe(customTabIndex)
      expect(screen.getByRole('button')).toHaveProperty(
        'tabIndex',
        customTabIndex,
      )
    })
  })

  describe('arbitrary props', () => {
    it('are passed to the host component', async () => {
      const buttonTestId = 'button-test-id'
      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton()
          return { getButtonProps, buttonRef, buttonTestId }
        },
        template: `<button ref="buttonRef" v-bind="getButtonProps({ 'data-testid': buttonTestId })" />`,
      })

      render(TestButton)
      expect(screen.getByRole('button')).toHaveAttribute(
        'data-testid',
        buttonTestId,
      )
    })
  })

  describe('event handlers', () => {
    // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
    // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
    it('key: Space fires a click event even if preventDefault was called on keyUp', async () => {
      const handleClick = vi.fn()

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({ native: false })
          const onKeyup = (event: KeyboardEvent) => event.preventDefault()

          return { getButtonProps, buttonRef, onKeyup, handleClick }
        },
        template: `<span ref="buttonRef" v-bind="getButtonProps({ onKeyup, onClick: handleClick })" />`,
      })

      const user = userEvent.setup()
      render(TestButton)

      const button = screen.getByRole('button')

      await user.keyboard('[Tab]')
      expect(button).toHaveFocus()

      await user.keyboard('[Space]')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('key: Enter fires keydown then click on non-native buttons', async () => {
      const handleKeydown = vi.fn()
      const handleClick = vi.fn()

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({ native: false })
          return { getButtonProps, buttonRef, handleKeydown, handleClick }
        },
        template: `<span ref="buttonRef" v-bind="getButtonProps({ onKeydown: handleKeydown, onClick: handleClick })" />`,
      })

      render(TestButton)

      const button = screen.getByRole('button')

      button.focus()
      expect(button).toHaveFocus()

      expect(handleKeydown).toHaveBeenCalledTimes(0)
      await fireEvent.keyDown(button, { key: 'Enter' })

      expect(handleKeydown).toHaveBeenCalledTimes(1)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('dev warnings', () => {
    it('errors if nativeButton=true but ref is not a button', async () => {
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockName('console.error')
        .mockImplementation(() => {})

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({ native: true })
          return { getButtonProps, buttonRef }
        },
        template: `<span v-bind="getButtonProps()" ref="buttonRef" />`,
      })

      render(TestButton)

      // wait a tick for watchEffect to fire
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Base UI Vue: A component that acts as a button expected a native <button> because '
          + 'the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, '
          + 'which can impact forms and accessibility. Use a real <button> in the `as` prop, or set '
          + '`nativeButton` to `false`.',
        ),
      )
      errorSpy.mockRestore()
    })

    it('errors if nativeButton=false but ref is a button', async () => {
      const errorSpy = vi
        .spyOn(console, 'error')
        .mockName('console.error')
        .mockImplementation(() => {})

      const TestButton = defineComponent({
        setup() {
          const { getButtonProps, buttonRef } = useButton({ native: false })
          return { getButtonProps, buttonRef }
        },
        template: `<button v-bind="getButtonProps()" ref="buttonRef" />`,
      })

      render(TestButton)

      // wait a tick for watchEffect to fire
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(errorSpy).toHaveBeenCalledTimes(1)
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Base UI Vue: A component that acts as a button expected a non-<button> because '
          + 'the `nativeButton` prop is false. Rendering a <button> keeps native behavior while Base UI Vue '
          + 'applies non-native attributes and handlers, which can add unintended extra attributes '
          + '(such as `role` or `aria-disabled`). Use a non-<button> in the `as` prop, or set '
          + '`nativeButton` to `true`.',
        ),
      )
      errorSpy.mockRestore()
    })
  })
})
