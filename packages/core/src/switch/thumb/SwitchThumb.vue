<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { SwitchRootState } from '../root/SwitchRoot.vue'
import { computed, useAttrs } from 'vue'
import { useFieldRootContext } from '../../field/root/FieldRootContext'
import { useRenderElement } from '../../utils/useRenderElement'
import { useSwitchRootContext } from '../root/SwitchRootContext'
import { stateAttributesMapping } from '../stateAttributesMapping'

export interface SwitchThumbState extends SwitchRootState {}

export interface SwitchThumbProps extends BaseUIComponentProps<SwitchThumbState> {}

/**
 * The movable part of the switch that indicates whether the switch is on or off.
 * Renders a `<span>`.
 *
 * Documentation: [Base UI Vue Switch](https://baseui-vue.com/docs/components/switch)
 */
defineOptions({
  name: 'SwitchThumb',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SwitchThumbProps>(), {
  as: 'span',
})

const attrs = useAttrs()
const attrsObject = attrs as Record<string, unknown>

const { state: fieldState } = useFieldRootContext()
const rootState = useSwitchRootContext()

const state = computed<SwitchThumbState>(() => ({
  ...fieldState.value,
  ...rootState.value,
}))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => attrsObject),
  stateAttributesMapping,
  defaultTagName: 'span',
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
