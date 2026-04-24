<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { ProgressRootState } from '../root/ProgressRoot.vue'
import { computed, useAttrs } from 'vue'
import { useRegisteredLabelId } from '../../utils/useRegisteredLabelId'
import { useRenderElement } from '../../utils/useRenderElement'
import { useProgressRootContext } from '../root/ProgressRootContext'
import { progressStateAttributesMapping } from '../root/stateAttributesMapping'

export interface ProgressLabelState extends ProgressRootState {}
export interface ProgressLabelProps extends BaseUIComponentProps<ProgressLabelState> {
  /**
   * The id of the label element. When provided, it overrides the
   * automatically generated one.
   */
  id?: string
}

/**
 * An accessible label for the progress bar.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Progress](https://baseui-vue.com/docs/components/progress)
 */
defineOptions({
  name: 'ProgressLabel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ProgressLabelProps>(), {
  as: 'span',
})

const attrs = useAttrs()
const { setLabelId, state } = useProgressRootContext()

const id = useRegisteredLabelId(() => props.id, setLabelId)

const labelProps = computed(() => ({
  ...attrs,
  id: id.value,
  role: 'presentation',
}))

const {
  tag,
  mergedProps,
  renderless,
} = useRenderElement({
  componentProps: props,
  state,
  props: labelProps,
  defaultTagName: 'span',
  stateAttributesMapping: progressStateAttributesMapping,
})
</script>

<template>
  <slot v-if="renderless" :props="mergedProps" :state="state" />
  <component :is="tag" v-else v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
