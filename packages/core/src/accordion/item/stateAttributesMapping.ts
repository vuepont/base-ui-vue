import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { AccordionItemState } from '../accordion.types'
import { collapsibleOpenStateMapping } from '../../utils/collapsibleOpenStateMapping'
import { transitionStatusMapping } from '../../utils/stateAttributesMapping'
import { AccordionItemDataAttributes } from './AccordionItemDataAttributes'

export const accordionStateAttributesMapping: StateAttributesMapping<AccordionItemState> = {
  ...collapsibleOpenStateMapping,
  index(value) {
    return Number.isInteger(value) ? { [AccordionItemDataAttributes.index]: String(value) } : null
  },
  ...transitionStatusMapping,
  value: () => null,
}
