<script setup lang="ts">
import type { AccordionPanelProps, AccordionPanelState } from '../accordion.types'
import { computed, onBeforeUnmount, useAttrs, watch, watchEffect } from 'vue'
import { useCollapsiblePanel } from '../../collapsible/panel/useCollapsiblePanel'
import { useCollapsibleRootContext } from '../../collapsible/root/CollapsibleRootContext'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { warn } from '../../utils/warn'
import { useAccordionItemContext } from '../item/AccordionItemContext'
import { accordionStateAttributesMapping } from '../item/stateAttributesMapping'
import { useAccordionRootContext } from '../root/AccordionRootContext'
import { AccordionPanelCssVars } from './AccordionPanelCssVars'

defineOptions({
  name: 'AccordionPanel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AccordionPanelProps>(), {
  as: 'div',
})

const attrs = useAttrs()

const rootCtx = useAccordionRootContext()
const collapsibleCtx = useCollapsibleRootContext()
const itemCtx = useAccordionItemContext()

const hiddenUntilFound = computed(() => rootCtx.hiddenUntilFound.value || props.hiddenUntilFound)
const keepMounted = computed(() => rootCtx.keepMounted.value || props.keepMounted)

if (process.env.NODE_ENV !== 'production') {
  watchEffect(() => {
    if (keepMounted.value === false && hiddenUntilFound.value) {
      warn(
        'The `:keepMounted="false"` prop on a AccordionPanel will be ignored when using `hiddenUntilFound` on the Panel or the Root since it requires the panel to remain mounted when closed.',
      )
    }
  })
}

watch(
  () => props.id,
  (id) => {
    if (id) {
      collapsibleCtx.setPanelIdState(id)
    }
  },
  { immediate: true, flush: 'sync' },
)

onBeforeUnmount(() => {
  collapsibleCtx.setPanelIdState(undefined)
})

watch(
  hiddenUntilFound,
  val => collapsibleCtx.setHiddenUntilFound(val),
  { immediate: true },
)

watch(
  keepMounted,
  val => collapsibleCtx.setKeepMounted(val),
  { immediate: true },
)

useOpenChangeComplete({
  open: computed(() => collapsibleCtx.open.value && collapsibleCtx.transitionStatus.value === 'idle'),
  ref: collapsibleCtx.panelRef,
  onComplete() {
    if (!collapsibleCtx.open.value) {
      return
    }
    collapsibleCtx.setDimensions({ width: undefined, height: undefined })
  },
})

const { hidden, panelRef } = useCollapsiblePanel({
  abortControllerRef: collapsibleCtx.abortControllerRef,
  animationTypeRef: collapsibleCtx.animationTypeRef,
  height: collapsibleCtx.height,
  hiddenUntilFound: hiddenUntilFound.value,
  id: computed(() => props.id ?? collapsibleCtx.panelId.value),
  keepMounted: keepMounted.value,
  mounted: collapsibleCtx.mounted,
  onOpenChange: collapsibleCtx.onOpenChange,
  open: collapsibleCtx.open,
  panelRef: collapsibleCtx.panelRef,
  runOnceAnimationsFinish: collapsibleCtx.runOnceAnimationsFinish,
  setDimensions: collapsibleCtx.setDimensions,
  setMounted: collapsibleCtx.setMounted,
  setOpen: collapsibleCtx.setOpen,
  setVisible: collapsibleCtx.setVisible,
  transitionDimensionRef: collapsibleCtx.transitionDimensionRef,
  visible: collapsibleCtx.visible,
  width: collapsibleCtx.width,
})

const panelState = computed<AccordionPanelState>(() => ({
  ...itemCtx.state.value,
  transitionStatus: collapsibleCtx.transitionStatus.value,
}))

const shouldRender = computed(() =>
  keepMounted.value || hiddenUntilFound.value || collapsibleCtx.mounted.value,
)

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(panelState.value, accordionStateAttributesMapping)
  const heightVal = collapsibleCtx.height.value
  const widthVal = collapsibleCtx.width.value

  return {
    ...attrs,
    'id': collapsibleCtx.panelId.value,
    'aria-labelledby': itemCtx.triggerId.value,
    'role': 'region',
    'hidden': hiddenUntilFound.value ? undefined : (hidden.value ? true : undefined),
    'class': typeof props.class === 'function' ? props.class(panelState.value) : props.class,
    'style': [
      typeof props.style === 'function' ? props.style(panelState.value) : props.style,
      {
        [AccordionPanelCssVars.accordionPanelHeight]: heightVal === undefined ? 'auto' : `${heightVal}px`,
        [AccordionPanelCssVars.accordionPanelWidth]: widthVal === undefined ? 'auto' : `${widthVal}px`,
      },
    ],
    ...stateAttributes,
  }
})
</script>

<template>
  <component :is="props.as" v-if="shouldRender" :ref="panelRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
