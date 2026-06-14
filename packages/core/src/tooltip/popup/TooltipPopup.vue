<script setup lang="ts">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../../utils/types'
import type { Align, Side } from '../../utils/useAnchorPositioning'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { TooltipInstantType } from '../root/TooltipRoot.vue'
import { computed, shallowRef, useAttrs, watch } from 'vue'
import { useHoverFloatingInteraction } from '../../floating-ui-vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { getDisabledMountTransitionStyles } from '../../utils/getDisabledMountTransitionStyles'
import { popupStateMapping } from '../../utils/popupStateMapping'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTooltipPositionerContext } from '../positioner/TooltipPositionerContext'
import { useTooltipRootContext } from '../root/TooltipRootContext'

/**
 * A container for the tooltip contents.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Tooltip](https://baseui-vue.com/docs/components/tooltip)
 */
defineOptions({
  name: 'TooltipPopup',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TooltipPopupProps>(), {
  as: 'div',
})

const stateAttributesMapping: StateAttributesMapping<TooltipPopupState> = {
  ...popupStateMapping,
  ...transitionStatusMapping,
}

const attrs = useAttrs()
const ctx = useTooltipRootContext()
const positioner = useTooltipPositionerContext()
const generatedId = useBaseUiId(props.id)
const localPopupRef = shallowRef<HTMLElement | null>(null)

const state = computed<TooltipPopupState>(() => ({
  open: ctx.open.value,
  side: positioner.side.value,
  align: positioner.align.value,
  instant: ctx.instantType.value,
  transitionStatus: ctx.transitionStatus.value,
}))

watch(
  () => props.id,
  () => ctx.setPopupId(generatedId),
  { immediate: true },
)

useOpenChangeComplete({
  open: () => ctx.open.value,
  ref: localPopupRef,
  onComplete() {
    ctx.completeOpenChange()
    ctx.instantType.value = undefined
  },
})

useHoverFloatingInteraction(ctx.floatingRootContext, {
  enabled: () => !ctx.disabled.value && !ctx.disableHoverablePopup.value,
  closeDelay: () => ctx.getCloseDelay(ctx.activeTrigger.value?.closeDelay),
})

const popupProps = computed(() => {
  return mergeProps(
    getDisabledMountTransitionStyles(ctx.transitionStatus.value),
    ctx.dismiss?.floating,
    attrs as Record<string, any>,
    {
      id: generatedId,
      role: 'tooltip',
    },
  )
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: {
    as: props.as,
    class: props.class,
    style: props.style,
  },
  state,
  props: popupProps,
  stateAttributesMapping,
  defaultTagName: 'div',
  ref: useMergedRefs(localPopupRef, ctx.popupRef),
})
</script>

<script lang="ts">
export interface TooltipPopupState {
  /**
   * Whether the tooltip is currently open.
   */
  open: boolean
  /**
   * The side of the anchor the component is placed on.
   */
  side: Side
  /**
   * The alignment of the component relative to the anchor.
   */
  align: Align
  /**
   * Whether transitions should be skipped.
   */
  instant: TooltipInstantType
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus
}

export interface TooltipPopupProps extends BaseUIComponentProps<TooltipPopupState> {
  /**
   * The popup id used by the trigger while open.
   */
  id?: string
}
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
