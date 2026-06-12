<script setup lang="ts">
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, NativeButtonProps, Orientation } from '../../utils/types'
import type { TabsRootChangeEventReason } from '../root/TabsRoot.vue'
import { computed, ref, useAttrs, watch } from 'vue'
import { ACTIVE_COMPOSITE_ITEM } from '../../composite/constants'
import { useCompositeItem } from '../../composite/item/useCompositeItem'
import { activeElement, contains } from '../../floating-ui-vue/utils'
import { mergeProps } from '../../merge-props/mergeProps'
import { useButton } from '../../use-button'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { ownerDocument } from '../../utils/owner'
import { REASONS } from '../../utils/reasons'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { useTabsListContext } from '../list/TabsListContext'
import { tabsStateAttributesMapping } from '../root/stateAttributesMapping'
import { useTabsRootContext } from '../root/TabsRootContext'
import { areTabValuesEqual } from '../utils/areTabValuesEqual'

export type TabsTabValue = any | null
export type TabsTabActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none'

export interface TabsTabPosition {
  left: number
  right: number
  top: number
  bottom: number
}

export interface TabsTabSize {
  width: number
  height: number
}

export interface TabsTabMetadata {
  disabled: boolean
  id: string | undefined
  value: TabsTabValue | undefined
}

export interface TabsTabState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean
  /**
   * Whether the component is active.
   */
  active: boolean
  /**
   * The component orientation.
   */
  orientation: Orientation
  /**
   * The direction used for tab activation.
   */
  tabActivationDirection: TabsTabActivationDirection
}

export interface TabsTabProps
  extends NativeButtonProps, BaseUIComponentProps<TabsTabState> {
  /**
   * The value of the Tab.
   */
  value: TabsTabValue
  /**
   * Whether the Tab is disabled.
   */
  disabled?: boolean
  /**
   * The id of the Tab element.
   */
  id?: string
}

/**
 * An individual interactive tab button that toggles the corresponding panel.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Vue Tabs](https://baseui-vue.com/docs/components/tabs)
 */
defineOptions({
  name: 'TabsTab',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsTabProps>(), {
  as: 'button',
  disabled: false,
  nativeButton: true,
})

const attrs = useAttrs()
const rootCtx = useTabsRootContext()
const listCtx = useTabsListContext()

const id = useBaseUiId(props.id)
const tabMetadata = computed<TabsTabMetadata>(() => ({
  disabled: props.disabled,
  id,
  value: props.value,
}))

const {
  compositeProps,
  compositeRef,
  index,
} = useCompositeItem<TabsTabMetadata>({
  metadata: () => tabMetadata.value,
})

const active = computed(() => areTabValuesEqual(props.value, rootCtx.value.value))
const isNavigating = ref(false)
const isPressing = ref(false)
const isMainButton = ref(false)
const tabElementRef = ref<HTMLElement | null>(null)

watch(
  tabElementRef,
  (tabElement, _, onCleanup) => {
    if (!tabElement) {
      return
    }
    const cleanup = listCtx.registerTabResizeObserverElement(tabElement)
    onCleanup(cleanup)
  },
  { flush: 'post' },
)

watch(
  [active, index, listCtx.highlightedTabIndex, listCtx.tabsListElement],
  () => {
    if (isNavigating.value) {
      isNavigating.value = false
      return
    }

    if (!(active.value && index.value > -1 && listCtx.highlightedTabIndex.value !== index.value)) {
      return
    }

    const listElement = listCtx.tabsListElement.value
    if (listElement != null) {
      const doc = ownerDocument(listElement)
      const focusedElement = doc ? activeElement(doc) : null
      if (focusedElement && contains(listElement, focusedElement)) {
        return
      }
    }

    if (!props.disabled) {
      listCtx.setHighlightedTabIndex(index.value)
    }
  },
  { flush: 'post' },
)

const { getButtonProps, buttonRef } = useButton({
  disabled: () => props.disabled,
  native: () => props.nativeButton ?? true,
  focusableWhenDisabled: () => true,
})

const tabPanelId = computed(() => rootCtx.getTabPanelIdByValue(props.value))

function createTabDetails(event?: Event) {
  return createChangeEventDetails<TabsRootChangeEventReason, { activationDirection: TabsTabActivationDirection }>(
    REASONS.none,
    event,
    undefined,
    { activationDirection: 'none' },
  ) as BaseUIChangeEventDetails<TabsRootChangeEventReason, { activationDirection: TabsTabActivationDirection }>
}

function handleClick(event: MouseEvent) {
  if (event.button !== 0 || active.value || props.disabled) {
    return
  }

  listCtx.onTabActivation(props.value, createTabDetails(event))
}

function handleFocus(event: FocusEvent) {
  if (active.value) {
    return
  }

  if (index.value > -1 && !props.disabled) {
    listCtx.setHighlightedTabIndex(index.value)
  }

  if (props.disabled) {
    return
  }

  if (
    listCtx.activateOnFocus.value
    && (!isPressing.value || (isPressing.value && isMainButton.value))
  ) {
    listCtx.onTabActivation(props.value, createTabDetails(event))
  }
}

function handlePointerDown(event: PointerEvent) {
  if (active.value || props.disabled) {
    return
  }

  isPressing.value = true

  function handlePointerUp() {
    isPressing.value = false
    isMainButton.value = false
  }

  if (!event.button || event.button === 0) {
    isMainButton.value = true

    const doc = ownerDocument(event.currentTarget as Element)
    doc?.addEventListener('pointerup', handlePointerUp, { once: true })
  }
}

const state = computed<TabsTabState>(() => ({
  disabled: props.disabled,
  active: active.value,
  orientation: rootCtx.orientation.value,
  tabActivationDirection: rootCtx.tabActivationDirection.value,
}))

function createTabProps() {
  return getButtonProps(mergeProps(
    compositeProps.value,
    {
      'role': 'tab',
      'aria-controls': tabPanelId.value,
      'aria-selected': active.value,
      id,
      [ACTIVE_COMPOSITE_ITEM]: active.value ? '' : undefined,
      'onClick': handleClick,
      'onFocus': handleFocus,
      'onPointerdown': handlePointerDown,
      onKeydownCapture() {
        isNavigating.value = true
      },
    },
    attrs as Record<string, any>,
  ))
}

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => createTabProps()),
  stateAttributesMapping: tabsStateAttributesMapping,
  defaultTagName: 'button',
  ref: useMergedRefs(buttonRef, compositeRef, tabElementRef),
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="state" />
  </component>
</template>
