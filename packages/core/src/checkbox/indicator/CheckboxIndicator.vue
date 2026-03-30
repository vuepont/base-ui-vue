<script setup lang="ts">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../../utils/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { CheckboxRootState } from '../root/CheckboxRoot.vue'
import { computed, ref, useAttrs } from 'vue'
import { fieldValidityMapping } from '../../field/utils/constants'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { useCheckboxRootContext } from '../root/CheckboxRootContext'
import { useCheckboxStateAttributesMapping } from '../utils/useStateAttributesMapping'

export interface CheckboxIndicatorState extends CheckboxRootState {
  transitionStatus: TransitionStatus
}

export interface CheckboxIndicatorProps extends BaseUIComponentProps<CheckboxIndicatorState> {
  /**
   * Whether to keep the element in the DOM when the checkbox is not checked.
   * @default false
   */
  keepMounted?: boolean
}

/**
 * Indicates whether the checkbox is ticked.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Checkbox](https://baseui-vue.com/docs/components/checkbox)
 */
defineOptions({
  name: 'CheckboxIndicator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CheckboxIndicatorProps>(), {
  as: 'span',
  keepMounted: false,
})

const attrs = useAttrs()
const attrsObject = attrs as Record<string, any>

const rootState = useCheckboxRootContext()
const rendered = computed(() => rootState.value.checked || rootState.value.indeterminate)
const { mounted, transitionStatus, setMounted } = useTransitionStatus(rendered)
const localIndicatorRef = ref<HTMLElement | null>(null)

const state = computed<CheckboxIndicatorState>(() => ({
  ...rootState.value,
  transitionStatus: transitionStatus.value,
}))

useOpenChangeComplete({
  open: rendered,
  ref: localIndicatorRef,
  onComplete() {
    // Delay unmounting until the close transition finishes so exit animations can run.
    if (!rendered.value) {
      setMounted(false)
    }
  },
})

const baseStateAttributesMapping = useCheckboxStateAttributesMapping(rootState)

const stateAttributesMapping: StateAttributesMapping<CheckboxIndicatorState> = {
  // Compose checkbox, transition, and validity attributes.
  ...baseStateAttributesMapping,
  ...transitionStatusMapping,
  ...fieldValidityMapping,
}

// `mounted` keeps the indicator in the tree while transitions settle; `keepMounted`
// lets consumers opt into always rendering it regardless of visibility.
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
