<script setup lang="ts">
import type { Ref } from 'vue'
import type { AccordionRootChangeEventDetails, AccordionRootProps, AccordionRootState, AccordionValue } from '../accordion.types'
import { computed, getCurrentInstance, provide, ref, useAttrs, watchEffect } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { useDirection } from '../../direction-provider/DirectionContext'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'
import { useControllableState } from '../../utils/useControllableState'
import { useRenderElement } from '../../utils/useRenderElement'
import { warn } from '../../utils/warn'
import { accordionRootContextKey } from './AccordionRootContext'
import { rootStateAttributesMapping } from './stateAttributesMapping'

defineOptions({
  name: 'AccordionRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AccordionRootProps>(), {
  as: 'div',
  disabled: false,
  hiddenUntilFound: false,
  keepMounted: false,
  loopFocus: true,
  multiple: false,
  orientation: 'vertical',
})

const emit = defineEmits<{
  (e: 'valueChange', value: AccordionValue, details: AccordionRootChangeEventDetails): void
}>()

const attrs = useAttrs()
const direction = useDirection()
const instance = getCurrentInstance()

if (process.env.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (props.hiddenUntilFound && props.keepMounted === false) {
      warn(
        'The `:keepMounted="false"` prop on a AccordionRoot will be ignored when using `hiddenUntilFound` since it requires Panels to remain mounted when closed.',
      )
    }
  })
}

const isValueControlled = computed(() => {
  const vnodeProps = instance?.vnode.props as Record<string, unknown> | null | undefined
  return Boolean(vnodeProps && 'value' in vnodeProps)
})

const _compositeRefs = { elementsRef: ref<Array<HTMLElement | null>>([]) as Ref<Array<HTMLElement | null>> }
const accordionItemRefs = _compositeRefs.elementsRef

const { value: openValues, setValue: setOpenValues } = useControllableState<AccordionValue>({
  controlled: () => (isValueControlled.value ? props.value : undefined),
  default: props.defaultValue ?? [],
})

function handleValueChange(newValue: any, nextOpen: boolean) {
  const details = createChangeEventDetails(REASONS.none)

  if (!props.multiple) {
    const nextValue = openValues.value[0] === newValue ? [] : [newValue]
    emit('valueChange', nextValue, details)
    if (details.isCanceled) {
      return
    }
    setOpenValues(nextValue)
  }
  else if (nextOpen) {
    const nextOpenValues = openValues.value.slice()
    nextOpenValues.push(newValue)
    emit('valueChange', nextOpenValues, details)
    if (details.isCanceled) {
      return
    }
    setOpenValues(nextOpenValues)
  }
  else {
    const nextOpenValues = openValues.value.filter(v => v !== newValue)
    emit('valueChange', nextOpenValues, details)
    if (details.isCanceled) {
      return
    }
    setOpenValues(nextOpenValues)
  }
}

const state = computed<AccordionRootState>(() => ({
  value: openValues.value,
  disabled: props.disabled,
  orientation: props.orientation,
}))

provide(accordionRootContextKey, {
  accordionItemRefs,
  direction,
  disabled: computed(() => props.disabled),
  handleValueChange,
  hiddenUntilFound: computed(() => props.hiddenUntilFound),
  keepMounted: computed(() => props.keepMounted),
  loopFocus: computed(() => props.loopFocus),
  orientation: computed(() => props.orientation),
  state,
  value: openValues as Ref<AccordionValue>,
})

const { tag, mergedProps, renderless } = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...attrs,
    dir: direction.value,
    role: 'region',
  })),
  stateAttributesMapping: rootStateAttributesMapping,
  defaultTagName: 'div',
})
</script>

<template>
  <CompositeList :elements-ref="_compositeRefs.elementsRef">
    <slot v-if="renderless" :props="mergedProps" :state="state" />
    <component :is="tag" v-else v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </CompositeList>
</template>
