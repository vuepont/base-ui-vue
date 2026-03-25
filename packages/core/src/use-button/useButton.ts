/* eslint-disable node/prefer-global/process */
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { BaseUIEvent, HTMLProps } from '../types'
import { isHTMLElement } from '@floating-ui/utils/dom'
import { ref, toValue, watchEffect } from 'vue'
import { useCompositeRootContext } from '../composite/root/CompositeRootContext'
import { makeEventPreventable, mergeProps } from '../merge-props'
import { error } from '../utils/error'
import { useFocusableWhenDisabled } from '../utils/useFocusableWhenDisabled'

export interface UseButtonParameters {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: MaybeRefOrGetter<boolean>
  /**
   * Whether the button may receive focus even if it is disabled.
   * @default false
   */
  focusableWhenDisabled?: MaybeRefOrGetter<boolean>
  /**
   * The tabIndex of the button.
   * @default 0
   */
  tabIndex?: MaybeRefOrGetter<number>
  /**
   * Whether the component is being rendered as a native button.
   * @default true
   */
  native?: MaybeRefOrGetter<boolean>
}

export interface AdditionalButtonProps extends Partial<{
  'aria-disabled': 'true' | 'false' | boolean
  'disabled': boolean
  'role': string
  'tabIndex'?: number
}> {}

export interface GenericButtonProps
  extends Omit<HTMLProps, 'onClick'>, AdditionalButtonProps {
  onClick?: (event: MouseEvent) => void
}

export interface UseButtonReturnValue {
  /**
   * Resolver for the button props.
   * @param externalProps additional props for the button
   * @returns props that should be spread on the button
   */
  getButtonProps: (externalProps?: GenericButtonProps) => Record<string, any>
  /**
   * A ref to the button DOM element. This ref should be passed to the rendered element.
   * It is not a part of the props returned by `getButtonProps`.
   */
  buttonRef: Ref<HTMLElement | null>
}

export function useButton(
  parameters: UseButtonParameters = {},
): UseButtonReturnValue {
  const buttonRef = ref<HTMLElement | null>(null)
  const isCompositeItem = useCompositeRootContext(true) !== undefined

  const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
    focusableWhenDisabled: () =>
      toValue(parameters.focusableWhenDisabled) ?? false,
    disabled: () => toValue(parameters.disabled) ?? false,
    composite: () => isCompositeItem,
    isNativeButton: () => toValue(parameters.native) ?? true,
    tabIndex: () => toValue(parameters.tabIndex) ?? 0,
  })

  if (process.env.NODE_ENV !== 'production') {
    watchEffect(() => {
      if (!buttonRef.value) {
        return
      }

      const isButtonTag = isButtonElement(buttonRef.value)
      const nativeButton = toValue(parameters.native) ?? true

      if (nativeButton) {
        if (!isButtonTag) {
          const message
            = 'A component that acts as a button expected a native <button> because the '
              + '`nativeButton` prop is true. Rendering a non-<button> removes native button '
              + 'semantics, which can impact forms and accessibility. Use a real <button> in the '
              + '`as` prop, or set `nativeButton` to `false`.'
          error(message)
        }
      }
      else if (isButtonTag) {
        const message
          = 'A component that acts as a button expected a non-<button> because the `nativeButton` '
            + 'prop is false. Rendering a <button> keeps native behavior while Base UI Vue applies '
            + 'non-native attributes and handlers, which can add unintended extra attributes (such '
            + 'as `role` or `aria-disabled`). Use a non-<button> in the `as` prop, or set '
            + '`nativeButton` to `true`.'
        error(message)
      }
    })
  }

  // handles a disabled composite button rendering another button, e.g.
  // <Toolbar.Button disabled as={<Menu.Trigger />} />
  // the `disabled` prop needs to pass through 2 `useButton`s then finally
  // delete the `disabled` attribute from DOM
  const updateDisabled = () => {
    const element = buttonRef.value
    if (!isButtonElement(element))
      return
    if (
      isCompositeItem
      && toValue(parameters.disabled)
      && focusableWhenDisabledProps.value.disabled === undefined
      && element.disabled
    ) {
      element.disabled = false
    }
  }
  watchEffect(updateDisabled, { flush: 'post' })

  const getButtonProps = (externalProps: GenericButtonProps = {}) => {
    const {
      onClick: externalOnClick,
      onMousedown: externalOnMousedown,
      onKeydown: externalOnKeydown,
      onKeyup: externalOnKeyup,
      onPointerdown: externalOnPointerdown,
      ...otherExternalProps
    } = externalProps as Record<string, any>

    const disabled = toValue(parameters.disabled) ?? false
    const isNativeButton = toValue(parameters.native) ?? true
    const type = isNativeButton ? 'button' : undefined

    return mergeProps(
      {
        type,
        onClick(event: MouseEvent) {
          if (disabled) {
            event.preventDefault()
            return
          }
          externalOnClick?.(event)
        },
        onMousedown(event: MouseEvent) {
          if (!disabled) {
            externalOnMousedown?.(event)
          }
        },
        onKeydown(event: BaseUIEvent<KeyboardEvent>) {
          if (disabled) {
            return
          }

          makeEventPreventable(event)
          externalOnKeydown?.(event)
          if (event.baseUIHandlerPrevented) {
            return
          }

          // Keyboard accessibility for non interactive elements
          const shouldClick
            = event.target === event.currentTarget
              && !isNativeButton
              && !isValidLinkElement(buttonRef.value)
          if (shouldClick) {
            const isEnterKey = event.key === 'Enter'
            const isSpaceKey = event.key === ' '
            if (isSpaceKey || isEnterKey) {
              event.preventDefault()
            }

            if (isEnterKey) {
              externalOnClick?.(event)
            }
          }
        },
        onKeyup(event: BaseUIEvent<KeyboardEvent>) {
          if (disabled) {
            return
          }

          // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
          // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
          makeEventPreventable(event)
          externalOnKeyup?.(event)
          if (event.baseUIHandlerPrevented) {
            return
          }

          // Keyboard accessibility for non interactive elements
          if (
            event.target === event.currentTarget
            && !isNativeButton
            && event.key === ' '
          ) {
            externalOnClick?.(event)
          }
        },
        onPointerdown(event: PointerEvent) {
          if (disabled) {
            event.preventDefault()
            return
          }
          externalOnPointerdown?.(event)
        },
      },
      !isNativeButton ? { role: 'button' } : undefined,
      focusableWhenDisabledProps.value,
      otherExternalProps,
    )
  }

  return {
    getButtonProps,
    buttonRef,
  }
}

function isButtonElement(elem: HTMLElement | null): elem is HTMLButtonElement {
  return isHTMLElement(elem) && elem.tagName === 'BUTTON'
}

function isValidLinkElement(
  elem: HTMLElement | null,
): elem is HTMLAnchorElement {
  return Boolean(elem?.tagName === 'A' && (elem as HTMLAnchorElement)?.href)
}
