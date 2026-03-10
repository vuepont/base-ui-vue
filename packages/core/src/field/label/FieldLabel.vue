<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { FieldRootState } from '../root/FieldRoot.vue'
import { computed, ref, useAttrs, watchEffect } from 'vue'
import { useLabelableContext } from '../../labelable-provider/LabelableContext'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { useBaseUiId } from '../../utils/useBaseUiId'
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

const labelRef = ref<HTMLElement | null>(null)

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

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(fieldRootContext.state.value, fieldValidityMapping)

  const baseProps: Record<string, any> = {
    ...attrs,
    id: labelId.value,
    ref: labelRef,
    class: typeof props.class === 'function' ? props.class(fieldRootContext.state.value) : props.class,
    style: typeof props.style === 'function' ? props.style(fieldRootContext.state.value) : props.style,
    ...stateAttributes,
  }

  if (props.nativeLabel) {
    baseProps.for = controlId.value ?? undefined
    baseProps.onMousedown = handleInteraction
  }
  else {
    baseProps.onClick = handleInteraction
    baseProps.onPointerdown = (event: PointerEvent) => {
      event.preventDefault()
    }
  }

  return baseProps
})
</script>

<template>
  <component :is="props.as" v-bind="mergedProps">
    <slot />
  </component>
</template>
