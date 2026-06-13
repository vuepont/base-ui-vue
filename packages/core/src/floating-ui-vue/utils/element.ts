import type { FloatingTriggerMap } from '../types'
import { isElement, isHTMLElement } from '@floating-ui/utils/dom'
import { TYPEABLE_SELECTOR } from './constants'
import { contains, getTarget } from './shadowDom'

export { contains, getTarget }

export function isTargetInsideEnabledTrigger(
  target: EventTarget | null,
  triggerElements: FloatingTriggerMap,
) {
  if (!isElement(target)) {
    return false
  }

  const targetElement = target as Element

  if (triggerElements.hasElement(targetElement)) {
    return !targetElement.hasAttribute('data-trigger-disabled')
  }

  for (const [, trigger] of triggerElements.entries()) {
    if (contains(trigger, targetElement)) {
      return !trigger.hasAttribute('data-trigger-disabled')
    }
  }

  return false
}

export function isTypeableElement(element: unknown): boolean {
  return isHTMLElement(element) && element.matches(TYPEABLE_SELECTOR)
}

export function isInteractiveElement(element: Element | null) {
  return (
    element?.closest(
      `button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),${TYPEABLE_SELECTOR}`,
    ) != null
  )
}

export function matchesFocusVisible(element: Element | null) {
  if (!element) {
    return true
  }

  try {
    return element.matches(':focus-visible')
  }
  catch {
    return true
  }
}
