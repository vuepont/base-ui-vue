import type { InjectionKey, Ref } from 'vue'
import { inject, shallowReadonly, shallowRef } from 'vue'
import { NOOP } from '../utils/empty'

export interface LabelableContext {
  /**
   * The `id` of the labelable element.
   * When `null` the association is implicit.
   */
  controlId: Readonly<Ref<string | null | undefined>>
  registerControlId: (source: symbol, id: string | null | undefined) => void
  setControlId: (id: string | null | undefined) => void
  labelId: Readonly<Ref<string | undefined>>
  setLabelId: (id: string | undefined) => void
  messageIds: Readonly<Ref<string[]>>
  setMessageIds: (updater: (ids: string[]) => string[]) => void
  getDescriptionProps: () => Record<string, string | undefined>
}

const defaultContext: LabelableContext = {
  controlId: shallowReadonly(shallowRef<string | null | undefined>(undefined)),
  registerControlId: NOOP,
  setControlId: NOOP,
  labelId: shallowReadonly(shallowRef<string | undefined>(undefined)),
  setLabelId: NOOP,
  messageIds: shallowReadonly(shallowRef<string[]>([])),
  setMessageIds: NOOP,
  getDescriptionProps: () => ({}),
}

export const labelableContextKey: InjectionKey<LabelableContext> = Symbol('LabelableContext')

export function useLabelableContext(): LabelableContext {
  return inject(labelableContextKey, defaultContext)
}
