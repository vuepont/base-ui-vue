<script setup lang="ts">
import type { Ref } from 'vue'
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, Orientation } from '../../utils/types'
import type { TabsTabActivationDirection, TabsTabMetadata, TabsTabValue } from '../tab/TabsTab.vue'
import { computed, getCurrentInstance, provide, ref, shallowRef, useAttrs, watch } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'
import { useControllableState } from '../../utils/useControllableState'
import { useRenderElement } from '../../utils/useRenderElement'
import { tabsStateAttributesMapping } from './stateAttributesMapping'
import { tabsRootContextKey } from './TabsRootContext'

export type TabsRootOrientation = Orientation

export interface TabsRootState {
  /**
   * The component orientation.
   */
  orientation: TabsRootOrientation
  /**
   * The direction used for tab activation.
   */
  tabActivationDirection: TabsTabActivationDirection
}

export type TabsRootChangeEventReason
  = | typeof REASONS.none
    | typeof REASONS.disabled
    | typeof REASONS.missing
    | typeof REASONS.initial

export type TabsRootChangeEventDetails = BaseUIChangeEventDetails<
  TabsRootChangeEventReason,
  {
    /**
     * The position of the active tab relative to the previously active tab.
     */
    activationDirection: TabsTabActivationDirection
  }
>

export interface TabsRootProps extends BaseUIComponentProps<TabsRootState> {
  /**
   * The default value. Use when the component is not controlled.
   * When the value is `null`, no Tab will be active.
   * @default 0
   */
  defaultValue?: TabsTabValue
  /**
   * The value of the currently active Tab. Use when the component is controlled.
   * When the value is `null`, no Tab will be active.
   */
  value?: TabsTabValue
  /**
   * The component orientation.
   * @default 'horizontal'
   */
  orientation?: TabsRootOrientation
}

/**
 * Groups the tabs and the corresponding panels.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Vue Tabs](https://baseui-vue.com/docs/components/tabs)
 */
defineOptions({
  name: 'TabsRoot',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TabsRootProps>(), {
  as: 'div',
  orientation: 'horizontal',
})

const emit = defineEmits<{
  /**
   * Event handler called when the active tab value changes.
   */
  valueChange: [value: TabsTabValue, eventDetails: TabsRootChangeEventDetails]
}>()

const attrs = useAttrs()
const instance = getCurrentInstance()
const vnodeProps = instance?.vnode.props as Record<string, unknown> | null | undefined

const isValueControlled = computed(() => props.value !== undefined)
const hasExplicitDefaultValueProp = Boolean(
  vnodeProps
  && (
    Object.prototype.hasOwnProperty.call(vnodeProps, 'defaultValue')
    || Object.prototype.hasOwnProperty.call(vnodeProps, 'default-value')
  ),
)

const initialDefaultValue = props.defaultValue ?? 0
const tabPanelRefs = ref<Array<HTMLElement | null>>([])
const tabPanelRefsHolder = { elementsRef: tabPanelRefs }
const tabMap = shallowRef<Map<Element, CompositeMetadata<TabsTabMetadata> | null>>(new Map())
const mountedTabPanels = shallowRef(new Map<TabsTabValue | number, string>())
const activationDirectionState = ref<{
  previousValue: TabsTabValue
  tabActivationDirection: TabsTabActivationDirection
}>({
  previousValue: initialDefaultValue,
  tabActivationDirection: 'none',
})

const { value, setValue } = useControllableState<TabsTabValue>({
  controlled: () => (isValueControlled.value ? props.value : undefined),
  default: () => props.defaultValue ?? 0,
  name: 'TabsRoot',
})

function getTabElementBySelectedValue(selectedValue: TabsTabValue | undefined) {
  if (selectedValue === undefined) {
    return null
  }

  for (const [tabElement, tabMetadata] of tabMap.value.entries()) {
    if (tabMetadata != null && selectedValue === (tabMetadata.value ?? tabMetadata.index)) {
      return tabElement as HTMLElement
    }
  }

  return null
}

function getTabIdByPanelValue(panelValue: TabsTabValue) {
  for (const tabMetadata of tabMap.value.values()) {
    if (tabMetadata != null && tabMetadata.value === panelValue) {
      return tabMetadata.id
    }
  }
  return undefined
}

function getTabPanelIdByValue(tabValue: TabsTabValue) {
  return mountedTabPanels.value.get(tabValue)
}

function registerMountedTabPanel(panelValue: TabsTabValue | number, panelId: string) {
  if (mountedTabPanels.value.get(panelValue) === panelId) {
    return
  }

  const next = new Map(mountedTabPanels.value)
  next.set(panelValue, panelId)
  mountedTabPanels.value = next
}

function unregisterMountedTabPanel(panelValue: TabsTabValue | number, panelId: string) {
  if (!mountedTabPanels.value.has(panelValue) || mountedTabPanels.value.get(panelValue) !== panelId) {
    return
  }

  const next = new Map(mountedTabPanels.value)
  next.delete(panelValue)
  mountedTabPanels.value = next
}

function setTabMap(map: Map<Element, CompositeMetadata<TabsTabMetadata> | null>) {
  tabMap.value = map
}

function notifyAutomaticValueChange(nextValue: TabsTabValue, reason: TabsRootChangeEventReason) {
  emit(
    'valueChange',
    nextValue,
    createChangeEventDetails(reason, undefined, undefined, {
      activationDirection: 'none',
    }),
  )
}

function setActivationDirection(previousValue: TabsTabValue, nextValue: TabsTabValue) {
  activationDirectionState.value = {
    previousValue: nextValue,
    tabActivationDirection: computeActivationDirection(
      previousValue,
      nextValue,
      props.orientation,
      tabMap.value,
    ),
  }
}

function onValueChange(newValue: TabsTabValue, eventDetails: TabsRootChangeEventDetails) {
  const activationDirection = computeActivationDirection(
    value.value,
    newValue,
    props.orientation,
    tabMap.value,
  )

  eventDetails.activationDirection = activationDirection
  emit('valueChange', newValue, eventDetails)

  if (eventDetails.isCanceled) {
    return
  }

  activationDirectionState.value = {
    previousValue: newValue,
    tabActivationDirection: activationDirection,
  }
  setValue(newValue)
}

watch(
  value,
  (nextValue, previousValue) => {
    if (nextValue !== previousValue) {
      setActivationDirection(previousValue, nextValue)
    }
  },
  { flush: 'sync' },
)

const selectedTabMetadata = computed(() => {
  for (const tabMetadata of tabMap.value.values()) {
    if (tabMetadata != null && tabMetadata.value === value.value) {
      return tabMetadata
    }
  }
  return undefined
})

const firstEnabledTabValue = computed(() => {
  for (const tabMetadata of tabMap.value.values()) {
    if (tabMetadata != null && !tabMetadata.disabled) {
      return tabMetadata.value
    }
  }
  return undefined
})

const shouldNotifyInitialValueChange = ref(!hasExplicitDefaultValueProp)
const shouldHonorDisabledDefaultValue = ref(hasExplicitDefaultValueProp)
const didRegisterTabs = ref(false)
const lastKnownTabElement = ref<Element | undefined>()

watch(
  [tabMap, value, selectedTabMetadata, firstEnabledTabValue],
  () => {
    if (isValueControlled.value) {
      return
    }

    function commitAutomaticValueChange(
      fallbackValue: TabsTabValue,
      fallbackReason: TabsRootChangeEventReason,
    ) {
      setValue(fallbackValue)
      activationDirectionState.value = {
        previousValue: fallbackValue,
        tabActivationDirection: 'none',
      }
      notifyAutomaticValueChange(fallbackValue, fallbackReason)
      shouldNotifyInitialValueChange.value = false
    }

    if (tabMap.value.size === 0) {
      if (
        didRegisterTabs.value
        && value.value !== null
        && !lastKnownTabElement.value?.isConnected
      ) {
        commitAutomaticValueChange(null, REASONS.missing)
      }
      return
    }

    didRegisterTabs.value = true
    lastKnownTabElement.value = tabMap.value.keys().next().value

    const selectionIsDisabled = selectedTabMetadata.value?.disabled
    const selectionIsMissing = selectedTabMetadata.value == null && value.value !== null

    if (!selectionIsDisabled && value.value === initialDefaultValue) {
      shouldHonorDisabledDefaultValue.value = false
    }

    if (
      shouldHonorDisabledDefaultValue.value
      && selectionIsDisabled
      && value.value === initialDefaultValue
    ) {
      return
    }

    if (selectionIsDisabled || selectionIsMissing) {
      const fallbackValue = firstEnabledTabValue.value ?? null

      if (value.value === fallbackValue) {
        shouldNotifyInitialValueChange.value = false
        return
      }

      let fallbackReason: TabsRootChangeEventReason = REASONS.missing

      if (shouldNotifyInitialValueChange.value) {
        fallbackReason = REASONS.initial
      }
      else if (selectionIsDisabled) {
        fallbackReason = REASONS.disabled
      }

      commitAutomaticValueChange(fallbackValue, fallbackReason)
      return
    }

    if (shouldNotifyInitialValueChange.value && selectedTabMetadata.value != null) {
      notifyAutomaticValueChange(value.value, REASONS.initial)
      shouldNotifyInitialValueChange.value = false
    }
  },
  { immediate: true, flush: 'post' },
)

const tabActivationDirection = computed(
  () => activationDirectionState.value.tabActivationDirection,
)

const state = computed<TabsRootState>(() => ({
  orientation: props.orientation,
  tabActivationDirection: tabActivationDirection.value,
}))

provide(tabsRootContextKey, {
  getTabElementBySelectedValue,
  getTabIdByPanelValue,
  getTabPanelIdByValue,
  onValueChange,
  orientation: computed(() => props.orientation),
  registerMountedTabPanel,
  setTabMap,
  tabActivationDirection,
  tabMap,
  tabPanelRefs,
  unregisterMountedTabPanel,
  value: value as Readonly<Ref<TabsTabValue>>,
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state,
  props: computed(() => attrs),
  stateAttributesMapping: tabsStateAttributesMapping,
  defaultTagName: 'div',
})

function computeActivationDirection(
  oldValue: TabsTabValue,
  newValue: TabsTabValue,
  orientation: TabsRootOrientation,
  tabsMap: Map<Element, CompositeMetadata<TabsTabMetadata> | null>,
): TabsTabActivationDirection {
  if (oldValue == null || newValue == null) {
    return 'none'
  }

  let oldTab: HTMLElement | null = null
  let newTab: HTMLElement | null = null

  for (const [tabElement, tabMetadata] of tabsMap.entries()) {
    if (tabMetadata == null) {
      continue
    }

    const tabValue = tabMetadata.value ?? tabMetadata.index
    if (oldValue === tabValue) {
      oldTab = tabElement as HTMLElement
    }
    if (newValue === tabValue) {
      newTab = tabElement as HTMLElement
    }
    if (oldTab != null && newTab != null) {
      break
    }
  }

  if (oldTab == null || newTab == null) {
    if (
      oldTab !== newTab
      && (typeof oldValue === 'number' || typeof oldValue === 'string')
      && typeof oldValue === typeof newValue
    ) {
      if (orientation === 'horizontal') {
        return newValue > oldValue ? 'right' : 'left'
      }
      return newValue > oldValue ? 'down' : 'up'
    }
    return 'none'
  }

  const oldRect = oldTab.getBoundingClientRect()
  const newRect = newTab.getBoundingClientRect()

  if (orientation === 'horizontal') {
    if (newRect.left < oldRect.left) {
      return 'left'
    }
    if (newRect.left > oldRect.left) {
      return 'right'
    }
  }
  else {
    if (newRect.top < oldRect.top) {
      return 'up'
    }
    if (newRect.top > oldRect.top) {
      return 'down'
    }
  }

  return 'none'
}
</script>

<template>
  <CompositeList :elements-ref="tabPanelRefsHolder.elementsRef">
    <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="state" />
    <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
      <slot :state="state" />
    </component>
  </CompositeList>
</template>
