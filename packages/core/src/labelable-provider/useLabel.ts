import type { MaybeRefOrGetter } from 'vue'
import { isHTMLElement } from '@floating-ui/utils/dom'
import { computed, toValue } from 'vue'
import { getTarget } from '../floating-ui-vue/utils'
import { ownerDocument } from '../utils/owner'
import { useRegisteredLabelId } from '../utils/useRegisteredLabelId'
import { useLabelableContext } from './LabelableContext'

export interface UseLabelParameters {
  id?: MaybeRefOrGetter<string | undefined>
  /**
   * Control id used when no labelable context control id exists.
   */
  fallbackControlId?: MaybeRefOrGetter<string | null | undefined>
  /**
   * Whether the rendered element is a native `<label>`.
   * @default false
   */
  native?: MaybeRefOrGetter<boolean | undefined>
  /**
   * Additional callback to sync the current label id with local component state/store.
   */
  setLabelId?: ((nextLabelId: string | undefined) => void) | undefined
  /**
   * Custom focus handler for non-native labels.
   * If omitted, focus behavior targets the resolved control id.
   */
  focusControl?:
    | ((event: MouseEvent, controlId: string | null | undefined) => void)
    | undefined
}

export function useLabel(params: UseLabelParameters = {}) {
  const {
    id: idProp,
    fallbackControlId,
    native,
    setLabelId: setLabelIdProp,
    focusControl: focusControlProp,
  } = params

  const { controlId: contextControlId, setLabelId: setContextLabelId } = useLabelableContext()

  const syncLabelId = (nextLabelId: string | undefined) => {
    setContextLabelId(nextLabelId)
    setLabelIdProp?.(nextLabelId)
  }

  const labelId = useRegisteredLabelId(idProp, syncLabelId)
  const resolvedControlId = computed(() => contextControlId.value ?? toValue(fallbackControlId))
  const isNative = computed(() => toValue(native) ?? false)

  function defaultFocusControl(event: MouseEvent, controlId: string | null | undefined) {
    if (!controlId) {
      return
    }

    const controlElement = ownerDocument(event.currentTarget as Element).getElementById(controlId)
    if (isHTMLElement(controlElement)) {
      focusElementWithVisible(controlElement)
    }
  }

  function handleInteraction(event: MouseEvent) {
    const target = getTarget(event) as HTMLElement | null
    if (target?.closest('button,input,select,textarea')) {
      return
    }

    if (!event.defaultPrevented && event.detail > 1) {
      event.preventDefault()
    }

    if (isNative.value) {
      return
    }

    if (focusControlProp) {
      focusControlProp(event, resolvedControlId.value)
      return
    }

    defaultFocusControl(event, resolvedControlId.value)
  }

  const labelProps = computed(() => {
    if (isNative.value) {
      return {
        id: labelId.value,
        for: resolvedControlId.value ?? undefined,
        onMousedown: handleInteraction,
      }
    }

    return {
      id: labelId.value,
      onClick: handleInteraction,
      onPointerdown(event: PointerEvent) {
        event.preventDefault()
      },
    }
  })

  return {
    labelId,
    props: labelProps,
  }
}

export function focusElementWithVisible(element: HTMLElement) {
  element.focus({
    // @ts-expect-error not available in types yet
    focusVisible: true,
  })
}
