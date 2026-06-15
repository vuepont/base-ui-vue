import type { Delay } from '../types'
import { isMouseLikePointerType } from '../utils/event'

export type {
  HandleClose,
  HandleCloseContext,
  HandleCloseContextBase,
  HandleCloseOptions,
} from '../types'
export { isTargetInsideEnabledTrigger as isInsideEnabledTrigger } from '../utils/element'

function resolveValue<T>(
  value: T | (() => T) | undefined,
  pointerType?: PointerEvent['pointerType'],
): T | 0 | undefined {
  if (pointerType != null && !isMouseLikePointerType(pointerType)) {
    return 0
  }

  if (typeof value === 'function') {
    return (value as () => T)()
  }

  return value
}

export function getDelay(
  value: Delay | (() => Delay) | undefined,
  prop: 'open' | 'close',
  pointerType?: PointerEvent['pointerType'],
) {
  const result = resolveValue(value, pointerType)
  if (typeof result === 'number') {
    return result
  }

  return result?.[prop]
}

export function getRestMs(value: number | (() => number)) {
  if (typeof value === 'function') {
    return value()
  }
  return value
}

export function isClickLikeOpenEvent(openEventType: string | undefined, interactedInside: boolean) {
  return interactedInside || openEventType === 'click' || openEventType === 'mousedown'
}

export function isHoverOpenEvent(openEventType: string | undefined) {
  return openEventType?.includes('mouse') && openEventType !== 'mousedown'
}
