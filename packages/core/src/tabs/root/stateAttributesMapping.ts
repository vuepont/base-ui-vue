import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { TabsRootState } from './TabsRoot.vue'
import { TabsRootDataAttributes } from './TabsRootDataAttributes'

export const tabsStateAttributesMapping: StateAttributesMapping<TabsRootState> = {
  tabActivationDirection: direction => ({
    [TabsRootDataAttributes.activationDirection]: direction,
  }),
}
