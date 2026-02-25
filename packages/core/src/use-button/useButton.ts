import type { MaybeRefOrGetter } from 'vue'
import type { BaseUIEvent } from '../types'
import { ref, toValue } from 'vue'
import { mergeProps } from '../../../plugins/src/merge-props'
import { useFocusableWhenDisabled } from '../../../plugins/src/use-focusable-when-disabled'

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

export function useButton(parameters: UseButtonParameters = {}) {
  const buttonRef = ref<HTMLElement | null>(null)

  const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled({
    focusableWhenDisabled: () =>
      toValue(parameters.focusableWhenDisabled) ?? false,
    disabled: () => toValue(parameters.disabled) ?? false,
    isNativeButton: () => toValue(parameters.native) ?? true,
    tabIndex: () => toValue(parameters.tabIndex) ?? 0,
  })

  const getButtonProps = (externalProps: Record<string, any> = {}) => {
    const disabled = toValue(parameters.disabled) ?? false
    const isNativeButton = toValue(parameters.native) ?? true
    const type = isNativeButton ? 'button' : undefined

    return mergeProps(
      {
        type,
        onClick(event: BaseUIEvent<MouseEvent>) {
          if (disabled) {
            event.preventDefault()
            event.stopImmediatePropagation()
            event.preventBaseUIHandler?.()
          }
        },
        onMousedown(event: BaseUIEvent<MouseEvent>) {
          if (disabled) {
            event.preventDefault()
            event.preventBaseUIHandler?.()
          }
        },
        onKeydown(event: KeyboardEvent) {
          if (disabled) {
            return
          }

          // Keyboard accessibility for non interactive elements
          const isNonNativeButton
            = !isNativeButton && !isValidLinkElement(buttonRef.value)
          if (isNonNativeButton && event.target === event.currentTarget) {
            const isEnterKey = event.key === 'Enter'
            const isSpaceKey = event.key === ' '
            if (isSpaceKey || isEnterKey) {
              event.preventDefault()
            }
            if (isEnterKey) {
              (event.currentTarget as HTMLElement).click()
            }
          }
        },
        onKeyup(event: KeyboardEvent) {
          if (disabled) {
            return
          }
          if (
            !isNativeButton
            && event.key === ' '
            && event.target === event.currentTarget
          ) {
            (event.currentTarget as HTMLElement).click()
          }
        },
      },
      !isNativeButton ? { role: 'button' } : undefined,
      focusableWhenDisabledProps.value,
      externalProps,
    )
  }

  return {
    getButtonProps,
    buttonRef,
  }
}

function isValidLinkElement(
  elem: HTMLElement | null,
): elem is HTMLAnchorElement {
  return Boolean(elem?.tagName === 'A' && (elem as HTMLAnchorElement)?.href)
}
