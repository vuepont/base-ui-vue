import type { InjectionKey, Ref } from 'vue'
import { inject } from 'vue'

export interface CompositeListContextValue<Metadata> {
  register: (node: Element, metadata: Metadata) => void
  unregister: (node: Element) => void
  subscribeMapChange: (
    fn: (map: Map<Element, Metadata | null>) => void,
  ) => () => void
  elementsRef: Ref<Array<HTMLElement | null>>
  labelsRef?: Ref<Array<string | null>> | undefined
  nextIndexRef: Ref<number>
}

export const compositeListContextKey = Symbol(
  'CompositeListContext',
) as InjectionKey<CompositeListContextValue<any>>

export function useCompositeListContext() {
  return inject(compositeListContextKey)
}
