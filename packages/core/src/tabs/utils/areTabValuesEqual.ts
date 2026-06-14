import type { TabsTabValue } from '../tab/TabsTab.vue'
import { toRaw } from 'vue'

export function areTabValuesEqual(a: TabsTabValue | undefined, b: TabsTabValue | undefined) {
  return a === b || toRaw(a) === toRaw(b)
}
