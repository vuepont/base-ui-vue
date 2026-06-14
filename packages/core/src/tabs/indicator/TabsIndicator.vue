<script setup lang="ts">
import type { StyleValue } from 'vue'
import type { BaseUIComponentProps, Orientation } from '../../utils/types'
import type { TabsRootState } from '../root/TabsRoot.vue'
import type { TabsTabActivationDirection, TabsTabPosition, TabsTabSize } from '../tab/TabsTab.vue'
import { computed, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { useCSPContext } from '../../csp-provider/CSPContext'
import { mergeProps } from '../../merge-props/mergeProps'
import { getCssDimensions } from '../../utils/getCssDimensions'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTabsListContext } from '../list/TabsListContext'
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping'
import { useTabsRootContext } from '../root/TabsRootContext'
import { script as prehydrationScript } from './prehydrationScript.min'
import { TabsIndicatorCssVars } from './TabsIndicatorCssVars'

export interface TabsIndicatorState extends TabsRootState {
  /**
   * The active tab position.
   */
  activeTabPosition: TabsTabPosition | null
  /**
   * The active tab size.
   */
  activeTabSize: TabsTabSize | null
  /**
   * The component orientation.
   */
  orientation: Orientation
  /**
   * The direction used for tab activation.
   */
  tabActivationDirection: TabsTabActivationDirection
}

export interface TabsIndicatorProps extends BaseUIComponentProps<TabsIndicatorState> {
  /**
   * Whether to render itself before Vue hydrates.
   * This minimizes the time that the indicator isn't visible after server-side rendering.
   * @default false
   */
  renderBeforeHydration?: boolean
}

/**
 * A visual indicator that can be styled to match the position of the currently active tab.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Vue Tabs](https://baseui-vue.com/docs/components/tabs)
 */
defineOptions({
  name: 'TabsIndicator',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsIndicatorProps>(), {
  as: 'span',
  renderBeforeHydration: false,
})

const attrs = useAttrs()
const { nonce } = useCSPContext()
const rootCtx = useTabsRootContext()
const listCtx = useTabsListContext()
const layoutTick = ref(0)
const isMounted = ref(false)

const cleanupIndicatorListener = listCtx.registerIndicatorUpdateListener(() => {
  layoutTick.value += 1
})

onMounted(() => {
  isMounted.value = true
})

onBeforeUnmount(() => {
  cleanupIndicatorListener()
})

const measurement = computed(() => {
  void layoutTick.value

  const tabsListElement = listCtx.tabsListElement.value
  const selectedValue = rootCtx.value.value

  if (selectedValue == null || tabsListElement == null) {
    return null
  }

  const activeTab = rootCtx.getTabElementBySelectedValue(selectedValue)

  if (activeTab == null) {
    return null
  }

  const { width, height } = getCssDimensions(activeTab)
  const { width: tabListWidth, height: tabListHeight } = getCssDimensions(tabsListElement)
  const tabRect = activeTab.getBoundingClientRect()
  const tabsListRect = tabsListElement.getBoundingClientRect()
  const scaleX = tabListWidth > 0 ? tabsListRect.width / tabListWidth : 1
  const scaleY = tabListHeight > 0 ? tabsListRect.height / tabListHeight : 1
  const hasNonZeroScale
    = Math.abs(scaleX) > Number.EPSILON && Math.abs(scaleY) > Number.EPSILON

  let left = 0
  let top = 0

  if (hasNonZeroScale) {
    left = (tabRect.left - tabsListRect.left) / scaleX + tabsListElement.scrollLeft - tabsListElement.clientLeft
    top = (tabRect.top - tabsListRect.top) / scaleY + tabsListElement.scrollTop - tabsListElement.clientTop
  }
  else {
    left = activeTab.offsetLeft
    top = activeTab.offsetTop
  }

  const right = tabsListElement.scrollWidth - left - width
  const bottom = tabsListElement.scrollHeight - top - height

  return {
    position: { left, right, top, bottom },
    size: { width, height },
  }
})

const activeTabPosition = computed(() => measurement.value?.position ?? null)
const activeTabSize = computed(() => measurement.value?.size ?? null)
const displayIndicator = computed(() =>
  activeTabSize.value != null && activeTabSize.value.width > 0 && activeTabSize.value.height > 0,
)

const state = computed<TabsIndicatorState>(() => ({
  orientation: rootCtx.orientation.value,
  activeTabPosition: activeTabPosition.value,
  activeTabSize: activeTabSize.value,
  tabActivationDirection: rootCtx.tabActivationDirection.value,
}))

const indicatorStyle = computed<StyleValue | undefined>(() => {
  const position = activeTabPosition.value
  const size = activeTabSize.value

  if (position == null || size == null) {
    return undefined
  }

  return {
    [TabsIndicatorCssVars.activeTabLeft]: `${position.left}px`,
    [TabsIndicatorCssVars.activeTabRight]: `${position.right}px`,
    [TabsIndicatorCssVars.activeTabTop]: `${position.top}px`,
    [TabsIndicatorCssVars.activeTabBottom]: `${position.bottom}px`,
    [TabsIndicatorCssVars.activeTabWidth]: `${size.width}px`,
    [TabsIndicatorCssVars.activeTabHeight]: `${size.height}px`,
  } as StyleValue
})

const indicatorProps = computed(() => mergeProps(
  {
    role: 'presentation',
    style: indicatorStyle.value,
    hidden: !displayIndicator.value,
    suppressHydrationWarning: props.renderBeforeHydration || undefined,
  },
  attrs as Record<string, unknown>,
))

const stateAttributesMapping = {
  ...tabsStateAttributesMapping,
  activeTabPosition: () => null,
  activeTabSize: () => null,
}

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: indicatorProps,
  stateAttributesMapping,
  defaultTagName: 'span',
})
</script>

<template>
  <template v-if="rootCtx.value.value !== null">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps" />
    <!-- eslint-disable-next-line vue/require-component-is -->
    <component
      is="script"
      v-if="props.renderBeforeHydration && !isMounted"
      :nonce="nonce"
      :suppress-hydration-warning="true"
    >
      {{ prehydrationScript }}
    </component>
  </template>
</template>
