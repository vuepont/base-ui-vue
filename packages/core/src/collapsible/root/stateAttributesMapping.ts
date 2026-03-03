import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { CollapsibleRootState } from '../collapsible.types'
import { collapsibleOpenStateMapping } from '../../utils/collapsibleOpenStateMapping'
import { transitionStatusMapping } from '../../utils/transitionStatusMapping'

export const collapsibleStateAttributesMapping: StateAttributesMapping<CollapsibleRootState> = {
  ...collapsibleOpenStateMapping,
  ...transitionStatusMapping,
}
