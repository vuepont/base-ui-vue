<script setup lang="ts">
import type { Ref } from 'vue'
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { BaseUIChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import type { BaseUIComponentProps, Orientation } from '../../utils/types'
import type { TabsTabActivationDirection, TabsTabMetadata, TabsTabValue } from '../tab/TabsTab.vue'
import { computed, provide, ref, shallowRef, useAttrs, watch } from 'vue'
import CompositeList from '../../composite/list/CompositeList.vue'
import { createChangeEventDetails } from '../../utils/createBaseUIEventDetails'
import { REASONS } from '../../utils/reasons'
import { useControllableState } from '../../utils/useControllableState'
import { useRenderElement } from '../../utils/useRenderElement'
import { areTabValuesEqual } from '../utils/areTabValuesEqual'
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

const isValueControlled = computed(() => props.value !== undefined)
const hasExplicitDefaultValueProp = props.defaultValue !== undefined

const initialDefaultValue = props.defaultValue === undefined ? 0 : props.defaultValue
const initialValue = isValueControlled.value ? props.value : initialDefaultValue
const tabPanelRefs = ref<Array<HTMLElement | null>>([])
const tabPanelRefsHolder = { elementsRef: tabPanelRefs }
const tabMap = shallowRef<Map<Element, CompositeMetadata<TabsTabMetadata> | null>>(new Map())
const lastKnownTabElementRef = shallowRef<Element | undefined>(undefined)
const mountedTabPanels = shallowRef(new Map<TabsTabValue | number, string>())
const activationDirectionState = ref<{
  previousValue: TabsTabValue
  tabActivationDirection: TabsTabActivationDirection
}>({
  previousValue: initialValue,
  tabActivationDirection: 'none',
})

const { value, setValue } = useControllableState<TabsTabValue>({
  controlled: () => (isValueControlled.value ? props.value : undefined),
  default: () => props.defaultValue === undefined ? 0 : props.defaultValue,
  name: 'TabsRoot',
})

function setTabValue(nextValue: TabsTabValue) {
  setValue(() => nextValue)
}

function getTabElementBySelectedValue(selectedValue: TabsTabValue | undefined) {
  if (selectedValue === undefined) {
    return null
  }

  for (const [tabElement, tabMetadata] of tabMap.value.entries()) {
    if (tabMetadata != null && areTabValuesEqual(selectedValue, tabMetadata.value ?? tabMetadata.index)) {
      return tabElement as HTMLElement
    }
  }

  return null
}

function getTabIdByPanelValue(panelValue: TabsTabValue) {
  for (const tabMetadata of tabMap.value.values()) {
    if (tabMetadata != null && areTabValuesEqual(tabMetadata.value, panelValue)) {
      return tabMetadata.id
    }
  }
  return undefined
}

function getTabPanelIdByValue(tabValue: TabsTabValue) {
  for (const [panelValue, panelId] of mountedTabPanels.value.entries()) {
    if (areTabValuesEqual(panelValue, tabValue)) {
      return panelId
    }
  }
  return undefined
}

function registerMountedTabPanel(panelValue: TabsTabValue | number, panelId: string) {
  for (const [mountedPanelValue, mountedPanelId] of mountedTabPanels.value.entries()) {
    if (areTabValuesEqual(mountedPanelValue, panelValue) && mountedPanelId === panelId) {
      return
    }
  }

  const next = new Map(mountedTabPanels.value)
  for (const mountedPanelValue of next.keys()) {
    if (areTabValuesEqual(mountedPanelValue, panelValue)) {
      next.delete(mountedPanelValue)
    }
  }
  next.set(panelValue, panelId)
  mountedTabPanels.value = next
}

function unregisterMountedTabPanel(panelValue: TabsTabValue | number, panelId: string) {
  let keyToDelete: TabsTabValue | number | undefined

  for (const [mountedPanelValue, mountedPanelId] of mountedTabPanels.value.entries()) {
    if (areTabValuesEqual(mountedPanelValue, panelValue) && mountedPanelId === panelId) {
      keyToDelete = mountedPanelValue
      break
    }
  }

  if (keyToDelete === undefined) {
    return
  }

  const next = new Map(mountedTabPanels.value)
  next.delete(keyToDelete)
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

  setTabValue(newValue)
}

watch(
  [value, tabMap, () => props.orientation],
  () => {
    const previousValue = activationDirectionState.value.previousValue
    const nextValue = value.value

    if (areTabValuesEqual(nextValue, previousValue)) {
      return
    }

    const tabActivationDirection = computeActivationDirection(
      previousValue,
      nextValue,
      props.orientation,
      tabMap.value,
    )
    const directionComputationIncomplete
      = previousValue != null
        && nextValue != null
        && getTabElementBySelectedValue(nextValue) == null

    activationDirectionState.value = {
      previousValue: directionComputationIncomplete ? previousValue : nextValue,
      tabActivationDirection,
    }
  },
  { flush: 'sync' },
)

const selectedTabMetadata = computed(() => {
  for (const tabMetadata of tabMap.value.values()) {
    if (tabMetadata != null && areTabValuesEqual(tabMetadata.value, value.value)) {
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
      setTabValue(fallbackValue)
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
        && !lastKnownTabElementRef.value?.isConnected
      ) {
        commitAutomaticValueChange(null, REASONS.missing)
      }
      return
    }

    didRegisterTabs.value = true
    lastKnownTabElementRef.value = tabMap.value.keys().next().value

    const selectionIsDisabled = selectedTabMetadata.value?.disabled
    const selectionIsMissing = selectedTabMetadata.value == null && value.value !== null

    if (!selectionIsDisabled && areTabValuesEqual(value.value, initialDefaultValue)) {
      shouldHonorDisabledDefaultValue.value = false
    }

    if (
      shouldHonorDisabledDefaultValue.value
      && selectionIsDisabled
      && areTabValuesEqual(value.value, initialDefaultValue)
    ) {
      return
    }

    if (selectionIsDisabled || selectionIsMissing) {
      const fallbackValue = firstEnabledTabValue.value ?? null

      if (areTabValuesEqual(value.value, fallbackValue)) {
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
    if (areTabValuesEqual(oldValue, tabValue)) {
      oldTab = tabElement as HTMLElement
    }
    if (areTabValuesEqual(newValue, tabValue)) {
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
