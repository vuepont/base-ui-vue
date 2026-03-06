import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'
import { NOOP } from '../utils/empty'

export interface LabelableContext {
  /**
   * The `id` of the labelable element.
   * When `null` the association is implicit.
   */
  controlId: Ref<string | null | undefined>
  setControlId: (id: string | null | undefined) => void
  labelId: Ref<string | undefined>
  setLabelId: (id: string | undefined) => void
  messageIds: Ref<string[]>
  setMessageIds: (updater: (ids: string[]) => string[]) => void
  getDescriptionProps: () => Record<string, string | undefined>
}

const defaultContext: LabelableContext = {
  controlId: { value: undefined } as Ref<string | null | undefined>,
  setControlId: NOOP,
  labelId: { value: undefined } as Ref<string | undefined>,
  setLabelId: NOOP,
  messageIds: { value: [] } as unknown as Ref<string[]>,
  setMessageIds: NOOP,
  getDescriptionProps: () => ({}),
}

export const labelableContextKey: InjectionKey<LabelableContext> = Symbol('LabelableContext')

export function useLabelableContext(): LabelableContext {
  return inject(labelableContextKey, defaultContext)
}
