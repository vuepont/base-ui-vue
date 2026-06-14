export { default as TabsIndicator } from './indicator/TabsIndicator.vue'
export type { TabsIndicatorProps, TabsIndicatorState } from './indicator/TabsIndicator.vue'
export { TabsIndicatorCssVars } from './indicator/TabsIndicatorCssVars'
export { TabsIndicatorDataAttributes } from './indicator/TabsIndicatorDataAttributes'

export { default as TabsList } from './list/TabsList.vue'
export type { TabsListProps, TabsListState } from './list/TabsList.vue'
export { tabsListContextKey, useTabsListContext } from './list/TabsListContext'
export type { TabsListContext } from './list/TabsListContext'
export { TabsListDataAttributes } from './list/TabsListDataAttributes'

export { default as TabsPanel } from './panel/TabsPanel.vue'
export type { TabsPanelMetadata, TabsPanelProps, TabsPanelState } from './panel/TabsPanel.vue'
export { TabsPanelDataAttributes } from './panel/TabsPanelDataAttributes'

export { default as TabsRoot } from './root/TabsRoot.vue'
export type {
  TabsRootChangeEventDetails,
  TabsRootChangeEventReason,
  TabsRootOrientation,
  TabsRootProps,
  TabsRootState,
} from './root/TabsRoot.vue'
export { tabsRootContextKey, useTabsRootContext } from './root/TabsRootContext'
export type { TabsRootContext } from './root/TabsRootContext'
export { TabsRootDataAttributes } from './root/TabsRootDataAttributes'

export { default as TabsTab } from './tab/TabsTab.vue'
export type {
  TabsTabActivationDirection,
  TabsTabMetadata,
  TabsTabPosition,
  TabsTabProps,
  TabsTabSize,
  TabsTabState,
  TabsTabValue,
} from './tab/TabsTab.vue'
export { TabsTabDataAttributes } from './tab/TabsTabDataAttributes'
