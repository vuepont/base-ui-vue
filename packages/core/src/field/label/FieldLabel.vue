<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, useAttrs, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useRenderElement } from '../../utils/useRenderElement'
import { useFieldRootContext } from '../root/FieldRootContext'
import { fieldValidityMapping } from '../utils/constants'

export type FieldLabelState = FieldRootState

export interface FieldLabelProps extends BaseUIComponentProps<FieldLabelState> {
  /**
   * The `id` attribute of the label element.
   */
  id?: string
  /**
   * Whether the component renders a native `<label>` element.
   * @default true
   */
  nativeLabel?: boolean
}

defineOptions({
  name: 'FieldLabel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<FieldLabelProps>(), {
  as: 'label',
  nativeLabel: true,
})

const attrs = useAttrs()

const fieldRootContext = useFieldRootContext(false)

const { controlId, setLabelId, labelId: contextLabelId } = useLabelableContext()

const generatedLabelId = useBaseUiId(props.id)
const labelId = computed(() => props.id ?? contextLabelId.value ?? generatedLabelId)

watchEffect((onCleanup) => {
  const id = labelId.value
  setLabelId(id)
  onCleanup(() => setLabelId(undefined))
})

function handleInteraction(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('button,input,select,textarea')) {
    return
  }

  if (!event.defaultPrevented && event.detail > 1) {
    event.preventDefault()
  }

  if (props.nativeLabel || !controlId.value) {
    return
  }

  const controlElement = document.getElementById(controlId.value)
  if (controlElement) {
    controlElement.focus()
  }
}

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state: fieldRootContext.state,
  props: computed(() => {
    if (props.nativeLabel) {
      return {
        ...attrs,
        id: labelId.value,
        for: controlId.value ?? undefined,
        onMousedown: handleInteraction,
      }
    }

    return {
      ...attrs,
      id: labelId.value,
      onClick: handleInteraction,
      onPointerdown: (event: PointerEvent) => {
        event.preventDefault()
      },
    }
  }),
  stateAttributesMapping: fieldValidityMapping,
  defaultTagName: 'label',
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="fieldRootContext.state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="fieldRootContext.state" />
  </component>
</template>
