import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

export interface UseFocusableWhenDisabledParameters {
  focusableWhenDisabled?: MaybeRefOrGetter<boolean | undefined>
  disabled: MaybeRefOrGetter<boolean>
  composite?: MaybeRefOrGetter<boolean>
  tabIndex?: MaybeRefOrGetter<number>
  isNativeButton: MaybeRefOrGetter<boolean>
}

export function useFocusableWhenDisabled(
  params: UseFocusableWhenDisabledParameters,
) {
  const props = computed(() => {
    const focusableWhenDisabled = toValue(params.focusableWhenDisabled)
    const disabled = toValue(params.disabled)
    const composite = toValue(params.composite) ?? false
    const tabIndexProp = toValue(params.tabIndex) ?? 0
    const isNativeButton = toValue(params.isNativeButton)

    const isFocusableComposite = composite && focusableWhenDisabled !== false
    const isNonFocusableComposite
      = composite && focusableWhenDisabled === false

    const additionalProps: Record<string, any> = {
      onKeydown(event: KeyboardEvent) {
        if (disabled && focusableWhenDisabled && event.key !== 'Tab') {
          event.preventDefault()
        }
      },
    }

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
      // Only set aria-disabled when true; Vue renders false as "false" attribute
      // if (disabled) {
      // additionalProps['aria-disabled'] = 'true'
      // }
      additionalProps['aria-disabled'] = disabled
    }

    if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) {
      additionalProps.disabled = disabled
    }

    return additionalProps
  })

  return { props }
}
