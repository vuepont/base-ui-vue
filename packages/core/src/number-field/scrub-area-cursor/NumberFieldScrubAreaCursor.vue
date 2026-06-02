<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { NumberFieldRootState } from '../root/NumberFieldRoot.vue'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { isWebKit } from '../../utils/detectBrowser'
import { useRenderElement } from '../../utils/useRenderElement'
import { useNumberFieldRootContext } from '../root/NumberFieldRootContext'
import { useNumberFieldScrubAreaContext } from '../scrub-area/NumberFieldScrubAreaContext'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'

export type NumberFieldScrubAreaCursorState = NumberFieldRootState

export interface NumberFieldScrubAreaCursorProps
  extends BaseUIComponentProps<NumberFieldScrubAreaCursorState> {}

defineOptions({
  name: 'NumberFieldScrubAreaCursor',
  inheritAttrs: false,
})

const props = defineProps<NumberFieldScrubAreaCursorProps>()

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const { state } = useNumberFieldRootContext()
const { isScrubbing, isTouchInput, isPointerLockDenied, scrubAreaCursorRef }
  = useNumberFieldScrubAreaContext()

const shouldRender = computed(
  () => isScrubbing.value && !isWebKit && !isTouchInput.value && !isPointerLockDenied.value,
)

function setCursorRef(el: Element | ComponentPublicInstance | null) {
  scrubAreaCursorRef.value = el as HTMLElement | null
}

const cursorProps = computed(() => mergeProps(
  {
    role: 'presentation',
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
    },
  },
  attrsObject,
))

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: cursorProps,
  stateAttributesMapping,
  defaultTagName: 'span',
  ref: setCursorRef,
})
</script>

<template>
  <Teleport v-if="shouldRender" to="body">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </Teleport>
</template>
