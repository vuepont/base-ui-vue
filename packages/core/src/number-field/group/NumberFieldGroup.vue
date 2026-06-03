<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { NumberFieldRootState } from '../root/NumberFieldRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { useRenderElement } from '../../utils/useRenderElement'
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'

export type NumberFieldGroupState = NumberFieldRootState

export interface NumberFieldGroupProps extends BaseUIComponentProps<NumberFieldGroupState> {}

defineOptions({
  name: 'NumberFieldGroup',
  inheritAttrs: false,
})

const props = defineProps<NumberFieldGroupProps>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const { state } = useNumberFieldRootContext()

const groupProps = computed(() => mergeProps(attrsObject, { role: 'group' }))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: groupProps,
  stateAttributesMapping,
  defaultTagName: 'div',
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
