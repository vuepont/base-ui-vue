import type { ComputedRef, InjectionKey, Ref, ShallowRef } from 'vue'
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { TabsTabActivationDirection, TabsTabMetadata, TabsTabValue } from '../tab/TabsTab.vue'
import type { TabsRootChangeEventDetails } from './TabsRoot.vue'
import { inject } from 'vue'

export interface TabsRootContext {
  /**
   * The currently active tab's value.
   */
  value: Readonly<Ref<TabsTabValue>>
  /**
   * Callback for setting new value.
   */
  onValueChange: (value: TabsTabValue, eventDetails: TabsRootChangeEventDetails) => void
  /**
   * The component orientation (layout flow direction).
   */
  orientation: ComputedRef<'horizontal' | 'vertical'>
  /**
   * Gets the element of the Tab with the given value.
   */
  getTabElementBySelectedValue: (selectedValue: TabsTabValue | undefined) => HTMLElement | null
  /**
   * Gets the `id` attribute of the Tab that corresponds to the given TabPanel value.
   */
  getTabIdByPanelValue: (panelValue: TabsTabValue) => string | undefined
  /**
   * Gets the `id` attribute of the TabPanel that corresponds to the given Tab value.
   */
  getTabPanelIdByValue: (tabValue: TabsTabValue) => string | undefined
  registerMountedTabPanel: (panelValue: TabsTabValue | number, panelId: string) => void
  setTabMap: (map: Map<Element, CompositeMetadata<TabsTabMetadata> | null>) => void
  /**
   * The position of the active tab relative to the previously active tab.
   */
  tabActivationDirection: Readonly<Ref<TabsTabActivationDirection>>
  tabMap: ShallowRef<Map<Element, CompositeMetadata<TabsTabMetadata> | null>>
  tabPanelRefs: Ref<Array<HTMLElement | null>>
  unregisterMountedTabPanel: (panelValue: TabsTabValue | number, panelId: string) => void
}

export const tabsRootContextKey: InjectionKey<TabsRootContext> = Symbol('TabsRootContext')

export function useTabsRootContext(optional: true): TabsRootContext | undefined
export function useTabsRootContext(optional?: false): TabsRootContext
export function useTabsRootContext(optional = false) {
  const context = inject(tabsRootContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: TabsRootContext is missing. Tabs parts must be placed within <TabsRoot>.',
    )
  }

  return context
}
