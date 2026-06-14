import type { Dimensions } from '@floating-ui/utils'
import { round } from '@floating-ui/utils'
import { getComputedStyle, isHTMLElement } from '@floating-ui/utils/dom'

export function getCssDimensions(element: Element): Dimensions {
  const css = getComputedStyle(element)
  let width = Number.parseFloat(css.width) || 0
  let height = Number.parseFloat(css.height) || 0
  const hasOffset = isHTMLElement(element)
  const offsetWidth = hasOffset ? element.offsetWidth : width
  const offsetHeight = hasOffset ? element.offsetHeight : height

  if (round(width) !== offsetWidth || round(height) !== offsetHeight) {
    width = offsetWidth
    height = offsetHeight
  }

  return { width, height }
}
