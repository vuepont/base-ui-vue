import type { InjectionKey, Ref } from 'vue'
import type { TabsRootChangeEventDetails } from '../root/TabsRoot.vue'
import type { TabsTabValue } from '../tab/TabsTab.vue'
import { inject } from 'vue'

export interface TabsListContext {
  activateOnFocus: Ref<boolean>
  highlightedTabIndex: Ref<number>
  registerIndicatorUpdateListener: (listener: () => void) => () => void
  registerTabResizeObserverElement: (element: HTMLElement) => () => void
  onTabActivation: (newValue: TabsTabValue, eventDetails: TabsRootChangeEventDetails) => void
  setHighlightedTabIndex: (index: number) => void
  tabsListElement: Ref<HTMLElement | null>
}

export const tabsListContextKey: InjectionKey<TabsListContext> = Symbol('TabsListContext')

export function useTabsListContext(optional: true): TabsListContext | undefined
export function useTabsListContext(optional?: false): TabsListContext
export function useTabsListContext(optional = false) {
  const context = inject(tabsListContextKey, undefined)
  if (!context && !optional) {
    throw new Error(
      'Base UI Vue: TabsListContext is missing. TabsList parts must be placed within <TabsList>.',
    )
  }

  return context
}
