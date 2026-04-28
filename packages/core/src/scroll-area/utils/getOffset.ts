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

  // Safari misreports `marginInlineEnd` in RTL.
  // We have to assume the start/end values are symmetrical, which is likely.
  if (axis === 'x' && prop === 'margin') {
    return Number.parseFloat(styles[`${prop}InlineStart` as any]) * 2
  }

  return (
    Number.parseFloat(styles[`${prop}${propAxis}Start` as any])
    + Number.parseFloat(styles[`${prop}${propAxis}End` as any])
  )
}
