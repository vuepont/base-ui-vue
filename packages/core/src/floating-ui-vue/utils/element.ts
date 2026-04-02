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
