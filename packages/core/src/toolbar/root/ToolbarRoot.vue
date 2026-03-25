<script setup lang="ts">
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { BaseUIComponentProps, Orientation } from '../../utils/types'
import type { ToolbarRootItemMetadata } from './ToolbarRootContext'
import { computed, provide, reactive, ref, useAttrs } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { compositeRootContextKey } from '../../composite/root/CompositeRootContext'
import { useCompositeRoot } from '../../composite/root/useCompositeRoot'
import { useDirection } from '../../direction-provider/DirectionContext'
import { isElementDisabled } from '../../utils/isElementDisabled'
import { useRenderElement } from '../../utils/useRenderElement'
import { toolbarRootContextKey } from './ToolbarRootContext'

export interface ToolbarRootState {
  /**
   * Whether the component is disabled.
   */
  disabled: boolean
  /**
   * The component orientation.
   */
  orientation: Orientation
}

export interface ToolbarRootProps extends BaseUIComponentProps<ToolbarRootState> {
  /**
   * Whether the component is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * The orientation of the toolbar.
   * @default 'horizontal'
   */
  orientation?: Orientation
  /**
   * If `true`, using keyboard navigation will wrap focus to the other end of
   * the toolbar once the end is reached.
   * @default true
   */
  loopFocus?: boolean
}

/**
 * A container for grouping a set of controls, such as buttons, toggle groups, or menus.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Toolbar](https://baseui-vue.com/docs/components/toolbar)
 */
defineOptions({
  name: 'ToolbarRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ToolbarRootProps>(), {
  as: 'div',
  disabled: false,
  orientation: 'horizontal',
  loopFocus: true,
})

const attrs = useAttrs()
const direction = useDirection()

const itemMap = ref(new Map<Element, CompositeMetadata<ToolbarRootItemMetadata> | null>())

const disabledIndices = computed(() => {
  const output: number[] = []

  itemMap.value.forEach((itemMetadata, element) => {
    if (
      itemMetadata?.index != null
      && !itemMetadata.focusableWhenDisabled
      && isElementDisabled(element as HTMLElement)
    ) {
      output.push(itemMetadata.index)
    }
  })

  return output
})

const state = computed<ToolbarRootState>(() => ({
  disabled: props.disabled,
  orientation: props.orientation,
}))

const root = useCompositeRoot({
  orientation: () => props.orientation,
  loopFocus: () => props.loopFocus,
  direction: () => direction.value,
  disabledIndices: () => disabledIndices.value,
})

provide(toolbarRootContextKey, {
  disabled: computed(() => props.disabled),
  orientation: computed(() => props.orientation),
})

provide(
  compositeRootContextKey,
  reactive({
    highlightedIndex: root.highlightedIndex,
    onHighlightedIndexChange: root.onHighlightedIndexChange,
    highlightItemOnHover: computed(() => false),
    relayKeyboardEvent: root.relayKeyboardEvent,
  }),
)

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => ({
    ...root.getRootProps(attrs),
    'role': 'toolbar',
    'aria-orientation': props.orientation,
  })),
  defaultTagName: 'div',
  ref: root.mergedRef,
})

function handleMapChange(newMap: Map<Element, { index?: number | null | undefined } | null>) {
  const typedMap = newMap as Map<Element, CompositeMetadata<ToolbarRootItemMetadata> | null>
  itemMap.value = typedMap
  root.onMapChange(typedMap)
}
</script>

<template>
  <CompositeList
    :elements-ref="root.elementsRef"
    @map-change="handleMapChange"
  >
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </CompositeList>
</template>
