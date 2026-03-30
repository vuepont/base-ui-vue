import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, ref, toValue, watchPostEffect } from 'vue'

export interface UseAriaLabelledByParameters {
  /**
   * Explicit `aria-labelledby` passed by the caller.
   * Takes precedence over all other sources.
   */
  ariaLabelledBy?: Ref<string | undefined>
  /**
   * Label id coming from `LabelableContext`.
   */
  labelId?: Ref<string | undefined>
  /**
   * DOM ref of the control or other labelable element.
   */
  labelSourceRef: { value: HTMLElement | null }
  /**
   * Whether to enable DOM-based fallback lookup
   * when neither `ariaLabelledBy` nor `labelId` is provided.
   * @default true
   */
  enableFallback?: boolean
  /**
   * Optional base id used when generating an id
   * for an implicit label discovered in the DOM.
   */
  labelSourceId?: MaybeRefOrGetter<string | undefined>
}

export function useAriaLabelledBy(params: UseAriaLabelledByParameters) {
  const { ariaLabelledBy, labelId, labelSourceRef, enableFallback = true, labelSourceId } = params

  const fallbackAriaLabelledBy = ref<string | undefined>(undefined)

  const generatedLabelId = computed(() => {
    const sourceId = toValue(labelSourceId)
    return sourceId ? `${sourceId}-label` : undefined
  })

  const resolvedAriaLabelledBy = computed(() => {
    const explicit = ariaLabelledBy?.value
    const fromContext = labelId?.value
    return explicit ?? fromContext ?? fallbackAriaLabelledBy.value
  })
  watchPostEffect(() => {
    const explicitOrContext = ariaLabelledBy?.value || labelId?.value
    if (explicitOrContext || !enableFallback) {
      fallbackAriaLabelledBy.value = undefined
      return
    }

    const next = getAriaLabelledBy(labelSourceRef.value, generatedLabelId.value)
    if (fallbackAriaLabelledBy.value !== next) {
      fallbackAriaLabelledBy.value = next
    }
  })

  return resolvedAriaLabelledBy
}

function getAriaLabelledBy(
  labelSource?: LabelSource | null,
  generatedLabelId?: string,
): string | undefined {
  const label = findAssociatedLabel(labelSource)
  if (!label) {
    return undefined
  }

  if (!label.id && generatedLabelId) {
    label.id = generatedLabelId
  }

  return label.id || undefined
}

function findAssociatedLabel(labelSource?: LabelSource | null): HTMLLabelElement | undefined {
  if (!labelSource) {
    return undefined
  }

  const parent = labelSource.parentElement
  if (parent && parent.tagName === 'LABEL') {
    return parent as HTMLLabelElement
  }

  const controlId = labelSource.id
  if (controlId) {
    const nextSibling = labelSource.nextElementSibling as HTMLLabelElement | null
    if (nextSibling && nextSibling.htmlFor === controlId) {
      return nextSibling
    }
  }

  const labels = (labelSource as any).labels as NodeListOf<HTMLLabelElement> | null | undefined
  return labels && labels[0] ? labels[0] : undefined
}

type LabelSource = HTMLElement & { labels?: NodeListOf<HTMLLabelElement> | null | undefined }
