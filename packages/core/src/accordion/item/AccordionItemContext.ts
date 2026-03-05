import type { InjectionKey, Ref } from 'vue'
import type { AccordionItemState } from '../accordion.types'
import { inject } from 'vue'

export interface AccordionItemContext {
  open: Ref<boolean>
  state: Ref<AccordionItemState>
  setTriggerId: (id: string | undefined) => void
  triggerId: Ref<string | undefined>
}

export const accordionItemContextKey = Symbol(
  'AccordionItemContext',
) as InjectionKey<AccordionItemContext>

export function useAccordionItemContext(): AccordionItemContext {
  const context = inject(accordionItemContextKey)
  if (context === undefined) {
    throw new Error(
      'Base UI Vue: AccordionItemContext is missing. Accordion parts must be placed within <AccordionItem>.',
    )
  }
  return context
}
