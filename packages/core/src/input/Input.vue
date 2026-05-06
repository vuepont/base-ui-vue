<script setup lang="ts">
import type { FieldControlProps, FieldControlState } from '../field'
import { useAttrs } from 'vue'
import FieldControl from '../field/control/FieldControl.vue'

export type InputState = FieldControlState

export interface InputProps extends FieldControlProps {}

/**
 * A native input element that automatically works with
 * [Field](https://baseui-vue.com/docs/components/field).
 * Renders an `<input>` element.
 *
 * Documentation: [Base UI Vue Input](https://baseui-vue.com/docs/components/input)
 */
defineOptions({
  name: 'BaseUIInput',
  inheritAttrs: false,
})

const props = defineProps<InputProps>()

defineEmits<{
  valueChange: [value: string, event: Event]
}>()

const attrs = useAttrs()
</script>

<template>
  <FieldControl v-bind="{ ...props, ...attrs }" @value-change="(v: string, e: Event) => $emit('valueChange', v, e)">
    <template v-if="$slots.default" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </FieldControl>
</template>
