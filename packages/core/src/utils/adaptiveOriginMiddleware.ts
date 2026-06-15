import type { Middleware } from '../floating-ui-vue'
import { getSide } from '@floating-ui/utils'
import { ownerDocument, ownerWindow } from './owner'

export const DEFAULT_SIDES = {
  sideX: 'left',
  sideY: 'top',
} as const

export const adaptiveOrigin: Middleware = {
  name: 'adaptiveOrigin',
  async fn(state) {
    const {
      x: rawX,
      y: rawY,
      rects: { floating: floatRect },
      elements: { floating },
      platform,
      strategy,
      placement,
    } = state

    const win = ownerWindow(floating)
    const styles = win.getComputedStyle(floating)
    const hasTransition = styles.transitionDuration !== '0s' && styles.transitionDuration !== ''

    if (!hasTransition) {
      return {
        x: rawX,
        y: rawY,
        data: DEFAULT_SIDES,
      }
    }

    const offsetParent = await platform.getOffsetParent?.(floating)

    let offsetDimensions = { width: 0, height: 0 }

    if (strategy === 'fixed' && win.visualViewport) {
      offsetDimensions = {
        width: win.visualViewport.width,
        height: win.visualViewport.height,
      }
    }
    else if (offsetParent === win) {
      const doc = ownerDocument(floating)
      offsetDimensions = {
        width: doc?.documentElement.clientWidth ?? 0,
        height: doc?.documentElement.clientHeight ?? 0,
      }
    }
    else if (await platform.isElement?.(offsetParent)) {
      offsetDimensions = await platform.getDimensions(offsetParent as Element)
    }

    const currentSide = getSide(placement)
    let x = rawX
    let y = rawY

    if (currentSide === 'left') {
      x = offsetDimensions.width - (rawX + floatRect.width)
    }
    if (currentSide === 'top') {
      y = offsetDimensions.height - (rawY + floatRect.height)
    }

    const sideX = currentSide === 'left' ? 'right' : DEFAULT_SIDES.sideX
    const sideY = currentSide === 'top' ? 'bottom' : DEFAULT_SIDES.sideY

    return {
      x,
      y,
      data: {
        sideX,
        sideY,
      },
    }
  },
}
