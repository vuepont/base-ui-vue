import type { ComputedRef, InjectionKey, Ref, ShallowRef } from 'vue'
import type { CompositeMetadata } from '../../composite/list/CompositeList.vue'
import type { TabsTabActivationDirection, TabsTabMetadata, TabsTabValue } from '../tab/TabsTab.vue'
import type { TabsRootChangeEventDetails } from './TabsRoot.vue'
import { inject } from 'vue'

export interface TabsRootContext {
  value: Readonly<Ref<TabsTabValue>>
  onValueChange: (value: TabsTabValue, eventDetails: TabsRootChangeEventDetails) => void
  orientation: ComputedRef<'horizontal' | 'vertical'>
  getTabElementBySelectedValue: (selectedValue: TabsTabValue | undefined) => HTMLElement | null
  getTabIdByPanelValue: (panelValue: TabsTabValue) => string | undefined
  getTabPanelIdByValue: (tabValue: TabsTabValue) => string | undefined
  registerMountedTabPanel: (panelValue: TabsTabValue | number, panelId: string) => void
  setTabMap: (map: Map<Element, CompositeMetadata<TabsTabMetadata> | null>) => void
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
