<script setup lang="ts">
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { BaseUIComponentProps, HTMLProps } from '../../utils/types'
import type { TabsRootState } from '../root/TabsRoot.vue'
import type { TabsTabMetadata, TabsTabValue } from '../tab/TabsTab.vue'
import { computed, onBeforeUnmount, provide, reactive, ref, useAttrs, watch } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { compositeRootContextKey } from '../../composite/root/CompositeRootContext'
import { useCompositeRoot } from '../../composite/root/useCompositeRoot'
import { useDirection } from '../../direction-provider/DirectionContext'
import { useRenderElement } from '../../utils/useRenderElement'
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping'
import { useTabsRootContext } from '../root/TabsRootContext'
import { areTabValuesEqual } from '../utils/areTabValuesEqual'
import { tabsListContextKey } from './TabsListContext'

export interface TabsListState extends TabsRootState {}

export interface TabsListProps extends BaseUIComponentProps<TabsListState> {
  /**
   * Whether to automatically change the active tab on arrow key focus.
   * Otherwise, tabs will be activated using Enter or Space key press.
   * @default false
   */
  activateOnFocus?: boolean
  /**
   * Whether to loop keyboard focus back to the first item when the end of the list is reached.
   * @default true
   */
  loopFocus?: boolean
}

/**
 * Groups the individual tab buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tabs](https://baseui-vue.com/docs/components/tabs)
 */
defineOptions({
  name: 'TabsList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsListProps>(), {
  as: 'div',
  activateOnFocus: false,
  loopFocus: true,
})

const attrs = useAttrs()
const rootCtx = useTabsRootContext()
const direction = useDirection()
const highlightedTabIndex = ref(0)
const tabsListElement = ref<HTMLElement | null>(null)
const indicatorUpdateListeners = new Set<() => void>()
const tabResizeObserverElements = new Set<HTMLElement>()
let resizeObserver: ResizeObserver | null = null

const root = useCompositeRoot({
  orientation: () => rootCtx.orientation.value,
  loopFocus: () => props.loopFocus,
  highlightedIndex: () => highlightedTabIndex.value,
  onHighlightedIndexChange: index => setHighlightedTabIndex(index),
  enableHomeAndEndKeys: () => true,
  stopEventPropagation: () => true,
  disabledIndices: () => [],
  direction: () => direction.value,
  rootRef: tabsListElement,
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

function notifyIndicatorUpdate() {
  indicatorUpdateListeners.forEach(listener => listener())
}

function resetResizeObserver() {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (typeof ResizeObserver === 'undefined') {
    return
  }

  resizeObserver = new ResizeObserver(notifyIndicatorUpdate)

  if (tabsListElement.value) {
    resizeObserver.observe(tabsListElement.value)
  }

  tabResizeObserverElements.forEach((element) => {
    resizeObserver?.observe(element)
  })
}

watch(tabsListElement, resetResizeObserver, { flush: 'post' })

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  indicatorUpdateListeners.clear()
  tabResizeObserverElements.clear()
})

function registerIndicatorUpdateListener(listener: () => void) {
  indicatorUpdateListeners.add(listener)
  return () => {
    indicatorUpdateListeners.delete(listener)
  }
}

function registerTabResizeObserverElement(element: HTMLElement) {
  tabResizeObserverElements.add(element)
  resizeObserver?.observe(element)
  notifyIndicatorUpdate()

  return () => {
    tabResizeObserverElements.delete(element)
    resizeObserver?.unobserve(element)
    notifyIndicatorUpdate()
  }
}

function setHighlightedTabIndex(index: number) {
  highlightedTabIndex.value = index
}

function onTabActivation(newValue: TabsTabValue, eventDetails: Parameters<typeof rootCtx.onValueChange>[1]) {
  if (!areTabValuesEqual(newValue, rootCtx.value.value)) {
    rootCtx.onValueChange(newValue, eventDetails)
  }
}

provide(tabsListContextKey, {
  activateOnFocus: computed(() => props.activateOnFocus),
  highlightedTabIndex,
  onTabActivation,
  registerIndicatorUpdateListener,
  registerTabResizeObserverElement,
  setHighlightedTabIndex,
  tabsListElement,
})

const state = computed<TabsListState>(() => ({
  orientation: rootCtx.orientation.value,
  tabActivationDirection: rootCtx.tabActivationDirection.value,
}))

const rootProps = computed<HTMLProps>(() => {
  const externalProps = {
    ...attrs,
    role: 'tablist',
  }
  const compositeProps = root.getRootProps(externalProps)

  compositeProps['aria-orientation']
    = rootCtx.orientation.value === 'vertical' ? 'vertical' : undefined

  return compositeProps
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: rootProps,
  stateAttributesMapping: tabsStateAttributesMapping,
  defaultTagName: 'div',
  ref: root.mergedRef,
})

function handleMapChange(map: Map<Element, CompositeMetadata<TabsTabMetadata> | null>) {
  rootCtx.setTabMap(map)
  root.onMapChange(map)
  notifyIndicatorUpdate()
}
</script>

<template>
  <CompositeList
    :elements-ref="root.elementsRef"
    :on-map-change="handleMapChange"
  >
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </CompositeList>
</template>
