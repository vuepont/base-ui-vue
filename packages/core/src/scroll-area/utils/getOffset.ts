export function getOffset(
  element: Element | null,
  prop: 'margin' | 'padding',
  axis: 'x' | 'y',
): number {
  if (!element) {
    return 0
  }

  const styles = getComputedStyle(element)
  const propAxis = axis === 'x' ? 'Inline' : 'Block'
  const start = getStyleNumber(styles, `${prop}${propAxis}Start`)
  const end = getStyleNumber(styles, `${prop}${propAxis}End`)

  // Safari misreports `marginInlineEnd` in RTL.
  // We have to assume the start/end values are symmetrical, which is likely.
  if (axis === 'x' && prop === 'margin' && styles.direction === 'rtl' && isSafari()) {
    return start * 2
  }

  return start + end
}

function getStyleNumber(styles: CSSStyleDeclaration, prop: string) {
  return Number.parseFloat(styles[prop as any]) || 0
}

function isSafari() {
  if (typeof navigator === 'undefined') {
    return false
  }

  return /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg\//.test(navigator.userAgent)
}
