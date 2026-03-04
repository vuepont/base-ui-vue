import { unref } from 'vue'

export function resolveRef(refOrElement: any): HTMLElement | null {
  const element = unref(refOrElement)
  if (element && '$el' in element) {
    return element.$el as HTMLElement
  }
  return element as HTMLElement | null
}
