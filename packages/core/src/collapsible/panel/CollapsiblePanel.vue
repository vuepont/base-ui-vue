<script setup lang="ts">
import type { CollapsiblePanelProps, CollapsiblePanelState } from '../collapsible.types'
import { computed, useAttrs, watch } from 'vue'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { warn } from '../../utils/warn'
import { useCollapsibleRootContext } from '../root/CollapsibleRootContext'
import { collapsibleStateAttributesMapping } from '../root/stateAttributesMapping'
import { CollapsiblePanelCssVars } from './CollapsiblePanelCssVars'
import { useCollapsiblePanel } from './useCollapsiblePanel'

defineOptions({
  name: 'CollapsiblePanel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CollapsiblePanelProps>(), {
  as: 'div',
  keepMounted: false,
  hiddenUntilFound: false,
})

const attrs = useAttrs()

const ctx = useCollapsibleRootContext()

watch(
  () => props.hiddenUntilFound,
  val => ctx.setHiddenUntilFound(val),
  { immediate: true },
)

watch(
  () => props.keepMounted,
  val => ctx.setKeepMounted(val),
  { immediate: true },
)

watch(
  () => props.id,
  id => ctx.setPanelIdState(id),
  { immediate: true, flush: 'sync' },
)

if (process.env.NODE_ENV !== 'production') {
  watch(
    [() => props.hiddenUntilFound, () => props.keepMounted] as const,
    ([hiddenUntilFound, keepMounted]) => {
      if (hiddenUntilFound && keepMounted === false) {
        warn(
          'The `:keep-mounted="false"` prop on a Collapsible will be ignored when using `hidden-until-found` since it requires the Panel to remain mounted even when closed.',
        )
      }
    },
    { immediate: true },
  )
}

const { hidden, panelRef } = useCollapsiblePanel({
  abortControllerRef: ctx.abortControllerRef,
  animationTypeRef: ctx.animationTypeRef,
  height: ctx.height,
  hiddenUntilFound: props.hiddenUntilFound,
  id: ctx.panelId,
  keepMounted: props.keepMounted,
  mounted: ctx.mounted,
  onOpenChange: ctx.onOpenChange,
  open: ctx.open,
  panelRef: ctx.panelRef,
  runOnceAnimationsFinish: ctx.runOnceAnimationsFinish,
  setDimensions: ctx.setDimensions,
  setMounted: ctx.setMounted,
  setOpen: ctx.setOpen,
  setVisible: ctx.setVisible,
  transitionDimensionRef: ctx.transitionDimensionRef,
  visible: ctx.visible,
  width: ctx.width,
})

useOpenChangeComplete({
  open: computed(() => ctx.open.value && ctx.transitionStatus.value === 'idle'),
  ref: ctx.panelRef,
  onComplete() {
    if (!ctx.open.value) {
      return
    }
    ctx.setDimensions({ height: undefined, width: undefined })
  },
})

const panelState = computed<CollapsiblePanelState>(() => ({
  ...ctx.state.value,
  transitionStatus: ctx.transitionStatus.value,
}))

const shouldRender = computed(() =>
  props.keepMounted || props.hiddenUntilFound || ctx.mounted.value,
)

const panelProps = computed(() => {
  const heightVal = ctx.height.value
  const widthVal = ctx.width.value

  return {
    ...attrs,
    id: ctx.panelId.value,
    hidden: props.hiddenUntilFound ? undefined : (hidden.value ? true : undefined),
    style: [
      {
        [CollapsiblePanelCssVars.collapsiblePanelHeight]: heightVal === undefined ? 'auto' : `${heightVal}px`,
        [CollapsiblePanelCssVars.collapsiblePanelWidth]: widthVal === undefined ? 'auto' : `${widthVal}px`,
      },
    ],
  }
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state: panelState,
  props: panelProps,
  stateAttributesMapping: collapsibleStateAttributesMapping,
  defaultTagName: 'div',
  ref: panelRef,
})
</script>

<template>
  <slot v-if="renderless && shouldRender" :ref="renderRef" :props="mergedProps" :state="panelState" />
  <component :is="tag" v-else-if="shouldRender" :ref="renderRef" v-bind="mergedProps">
    <slot :state="panelState" />
  </component>
</template>
