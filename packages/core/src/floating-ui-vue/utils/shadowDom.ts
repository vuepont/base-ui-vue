import { isShadowRoot } from '@floating-ui/utils/dom'

export function activeElement(doc: Document) {
  let element = doc.activeElement

  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement
  }

  return element
}

export function contains(parent?: Element | null, child?: Element | null) {
  if (!parent || !child) {
    return false
  }

  const rootNode = child.getRootNode?.()

  if (parent.contains(child)) {
    return true
  }

  if (rootNode && isShadowRoot(rootNode)) {
    let next: Element | null = child
    while (next) {
      if (parent === next) {
        return true
      }

      next = (next.parentNode as Element | null) ?? ((next as unknown as ShadowRoot).host ?? null)
    }
  }

  return false
}

export function getTarget(event: Event) {
  if ('composedPath' in event) {
    return event.composedPath()[0]
  }

  return (event as Event).target
}
