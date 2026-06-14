<script setup lang="ts">
import type { BaseUIComponentProps } from '../../utils/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { RadioRootState } from '../root/RadioRoot.vue'
import { computed, ref, useAttrs } from 'vue'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { useRadioRootContext } from '../root/RadioRootContext'
import { stateAttributesMapping } from '../utils/stateAttributesMapping'

export interface RadioIndicatorState extends RadioRootState {
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus
}

export interface RadioIndicatorProps extends BaseUIComponentProps<RadioIndicatorState> {
  /**
   * Whether to keep the HTML element in the DOM when the radio button is inactive.
   * @default false
   */
  keepMounted?: boolean
}

/**
 * Indicates whether the radio button is selected.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Radio](https://baseui-vue.com/docs/components/radio)
 */
defineOptions({
  name: 'RadioIndicator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RadioIndicatorProps>(), {
  as: 'span',
  keepMounted: false,
})

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const rootState = useRadioRootContext()
const rendered = computed(() => rootState.value.checked)
const { mounted, transitionStatus, setMounted } = useTransitionStatus(rendered)
const localIndicatorRef = ref<HTMLElement | null>(null)

const state = computed<RadioIndicatorState>(() => ({
  ...rootState.value,
  transitionStatus: transitionStatus.value,
}))

useOpenChangeComplete({
  open: rendered,
  ref: localIndicatorRef,
  onComplete() {
    if (!rendered.value) {
      setMounted(false)
    }
  },
})

const shouldRender = computed(() => props.keepMounted || mounted.value)

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
  ref: localIndicatorRef,
})
</script>

<template>
  <template v-if="shouldRender">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </template>
</template>
