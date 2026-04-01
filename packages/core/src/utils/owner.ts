export { getWindow as ownerWindow } from '@floating-ui/utils/dom'

export function ownerDocument(node: Element | null): Document | null {
  return node?.ownerDocument || (typeof document !== 'undefined' ? document : null)
}
