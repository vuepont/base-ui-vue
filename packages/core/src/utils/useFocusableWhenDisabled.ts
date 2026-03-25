import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface UseFocusableWhenDisabledParameters {
  /**
   * Whether the component should be focusable when disabled.
   * When `undefined`, composite items are focusable when disabled by default.
   */
  focusableWhenDisabled?: MaybeRefOrGetter<boolean | undefined>
  /**
   * The disabled state of the component.
   */
  disabled: MaybeRefOrGetter<boolean>
  /**
   * Whether this is a composite item or not.
   * @default false
   */
  composite?: MaybeRefOrGetter<boolean>
  /**
   * @default 0
   */
  tabIndex?: MaybeRefOrGetter<number>
  /**
   * @default true
   */
  isNativeButton: MaybeRefOrGetter<boolean>
}

interface FocusableWhenDisabledProps {
  'aria-disabled'?: boolean | undefined
  'disabled'?: boolean | undefined
  'onKeydown': (event: KeyboardEvent) => void
  'tabIndex': number
}

export interface UseFocusableWhenDisabledReturnValue {
  props: ComputedRef<FocusableWhenDisabledProps>
}

export function useFocusableWhenDisabled(
  params: UseFocusableWhenDisabledParameters,
): UseFocusableWhenDisabledReturnValue {
  const props = computed(() => {
    const focusableWhenDisabled = toValue(params.focusableWhenDisabled)
    const disabled = toValue(params.disabled)
    const composite = toValue(params.composite) ?? false
    const tabIndexProp = toValue(params.tabIndex) ?? 0
    const isNativeButton = toValue(params.isNativeButton)

    const isFocusableComposite = composite && focusableWhenDisabled !== false
    const isNonFocusableComposite
      = composite && focusableWhenDisabled === false

    const additionalProps = {
      onKeydown(event: KeyboardEvent) {
        if (
          disabled
          && focusableWhenDisabled
          && !composite
          && event.key !== 'Tab'
        ) {
          event.preventDefault()
        }
      },
    } as FocusableWhenDisabledProps

    if (!composite) {
      additionalProps.tabIndex = tabIndexProp

      if (!isNativeButton && disabled) {
        additionalProps.tabIndex = focusableWhenDisabled ? tabIndexProp : -1
      }
    }

    if (
      (isNativeButton && (focusableWhenDisabled || isFocusableComposite))
      || (!isNativeButton && disabled)
    ) {
      additionalProps['aria-disabled'] = disabled
    }

    if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) {
      additionalProps.disabled = disabled
    }

    return additionalProps
  })

  return { props }
}
