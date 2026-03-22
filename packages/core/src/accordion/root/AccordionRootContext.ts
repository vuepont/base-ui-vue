import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type { TextDirection } from '../../direction-provider/DirectionContext'
import type { Orientation } from '../../utils/types'
import type { AccordionRootState, AccordionValue } from '../accordion.types'
import { inject } from 'vue'

export interface AccordionRootContext<Value = any> {
  accordionItemRefs: Ref<Array<HTMLElement | null>>
  direction: ComputedRef<TextDirection>
  disabled: Ref<boolean>
  handleValueChange: (
    newValue: AccordionValue<Value>[number],
    nextOpen: boolean,
  ) => void
  hiddenUntilFound: Ref<boolean>
  keepMounted: Ref<boolean>
  loopFocus: Ref<boolean>
  orientation: Ref<Orientation>
  state: Ref<AccordionRootState<Value>>
  value: Ref<AccordionValue<Value>>
}

export const accordionRootContextKey = Symbol(
  'AccordionRootContext',
) as InjectionKey<AccordionRootContext>

export function useAccordionRootContext<
  Value = any,
>(): AccordionRootContext<Value> {
  const context = inject<AccordionRootContext<Value>>(accordionRootContextKey)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: AccordionRootContext is missing. Accordion parts must be placed within <AccordionRoot>.',
    )
  }
  return context
}
