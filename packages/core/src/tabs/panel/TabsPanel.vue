<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type { TransitionStatus } from '../../utils/useTransitionStatus'
import type { TabsRootState } from '../root/TabsRoot.vue'
import type { TabsTabValue } from '../tab/TabsTab.vue'
import { computed, ref, useAttrs, watch } from 'vue'
import { useCompositeListItem } from '../../composite/list/useCompositeListItem'
import { mergeProps } from '../../merge-props/mergeProps'
import { transitionStatusMapping } from '../../utils/transitionStatusMapping'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useOpenChangeComplete } from '../../utils/useOpenChangeComplete'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTransitionStatus } from '../../utils/useTransitionStatus'
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping'
import { useTabsRootContext } from '../root/TabsRootContext'
import { areTabValuesEqual } from '../utils/areTabValuesEqual'
import { TabsPanelDataAttributes } from './TabsPanelDataAttributes'

export interface TabsPanelMetadata {
  id?: string | undefined
  value: TabsTabValue
}

export interface TabsPanelState extends TabsRootState {
  /**
   * Whether the component is hidden.
   */
  hidden: boolean
  /**
   * The transition status of the component.
   */
  transitionStatus: TransitionStatus
}

export interface TabsPanelProps extends BaseUIComponentProps<TabsPanelState> {
  /**
   * The value of the TabPanel. It will be shown when the Tab with the corresponding value is active.
   */
  value: TabsTabValue
  /**
   * Whether to keep the HTML element in the DOM while the panel is hidden.
   * @default false
   */
  keepMounted?: boolean
  /**
   * The id of the TabPanel element.
   */
  id?: string
}

/**
 * A panel displayed when the corresponding tab is active.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tabs](https://baseui-vue.com/docs/components/tabs)
 */
defineOptions({
  name: 'TabsPanel',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsPanelProps>(), {
  as: 'div',
  keepMounted: false,
})

const attrs = useAttrs()
const rootCtx = useTabsRootContext()
const id = useBaseUiId(props.id)
const panelRef = ref<HTMLElement | null>(null)

const metadata = computed<TabsPanelMetadata>(() => ({
  id,
  value: props.value,
}))

const { ref: listItemRef, index } = useCompositeListItem<TabsPanelMetadata>({
  metadata: () => metadata.value,
})

const open = computed(() => areTabValuesEqual(props.value, rootCtx.value.value))
const { mounted, transitionStatus, setMounted } = useTransitionStatus(open)
const hidden = computed(() => !mounted.value)
const correspondingTabId = computed(() => rootCtx.getTabIdByPanelValue(props.value))

const state = computed<TabsPanelState>(() => ({
  hidden: hidden.value,
  orientation: rootCtx.orientation.value,
  tabActivationDirection: rootCtx.tabActivationDirection.value,
  transitionStatus: transitionStatus.value,
}))

useOpenChangeComplete({
  open,
  ref: panelRef,
  onComplete() {
    if (!open.value) {
      setMounted(false)
    }
  },
})

watch(
  [hidden, () => props.keepMounted, () => props.value],
  (_value, _oldValue, onCleanup) => {
    if (hidden.value && !props.keepMounted) {
      return
    }

    if (id == null) {
      return
    }

    rootCtx.registerMountedTabPanel(props.value, id)
    onCleanup(() => {
      rootCtx.unregisterMountedTabPanel(props.value, id)
    })
  },
  { immediate: true },
)

const shouldRender = computed(() => props.keepMounted || mounted.value)

const panelProps = computed(() => mergeProps(
  {
    'aria-labelledby': correspondingTabId.value,
    'hidden': hidden.value ? true : undefined,
    id,
    'inert': !open.value ? '' : undefined,
    'role': 'tabpanel',
    'tabindex': open.value ? 0 : -1,
    [TabsPanelDataAttributes.index]: index.value,
  },
  attrs as Record<string, unknown>,
))

const stateAttributesMapping = {
  ...tabsStateAttributesMapping,
  ...transitionStatusMapping,
}

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: panelProps,
  stateAttributesMapping,
  defaultTagName: 'div',
  ref: (node: Element | ComponentPublicInstance | null) => {
    const element = node instanceof HTMLElement ? node : null
    panelRef.value = element
    listItemRef(element)
  },
})
</script>

<template>
  <slot v-if="renderless && shouldRender" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else-if="shouldRender" :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
