import type { BaseUIEvent } from '../utils/types'
import { mergeProps as vueMergeProps } from 'vue'

export function makeEventPreventable<T extends Event>(
  event: T,
): BaseUIEvent<T> {
  const baseUIEvent = event as BaseUIEvent<T>
  if (!baseUIEvent.preventBaseUIHandler) {
    baseUIEvent.preventBaseUIHandler = () => {
      baseUIEvent.baseUIHandlerPrevented = true
    }
  }
  return baseUIEvent
}

export function mergeClasses(
  ourClass: string | undefined,
  theirClass: string | undefined,
) {
  if (theirClass) {
    if (ourClass) {
      return `${theirClass} ${ourClass}`
    }
    return theirClass
  }
  return ourClass
}

export function mergeObjects<
  A extends object | undefined,
  B extends object | undefined,
>(a: A, b: B) {
  if (a && !b)
    return a
  if (!a && b)
    return b
  if (a || b)
    return { ...a, ...b }
  return undefined
}

function isEventHandler(key: string, value: unknown) {
  return (
    key.startsWith('on')
    && key.charCodeAt(2) >= 65
    && key.charCodeAt(2) <= 90
    && (typeof value === 'function'
      || Array.isArray(value)
      || typeof value === 'undefined')
  )
}

/**
 * Merges multiple sets of props.
 * Follows the Base UI Vue pattern: rightmost takes precedence, except for:
 * - Event handlers: Merged, leftmost (internal) executes first, can prevent rightmost.
 * - class: Concatenated natively by Vue.
 * - style: Merged natively by Vue.
 */
export function mergeProps(
  ...args: (Record<string, any> | undefined)[]
): Record<string, any> {
  const merged = vueMergeProps(...(args as any))

  for (const propName in merged) {
    if (isEventHandler(propName, merged[propName])) {
      const handlers = merged[propName]
      if (Array.isArray(handlers)) {
        // Flatten the handlers array in case Vue returns nested arrays
        const flatHandlers = handlers.flat(Infinity).filter(Boolean) as ((
          ...args: any[]
        ) => void)[]

        merged[propName] = (event: unknown) => {
          if (event != null && typeof event === 'object') {
            const baseUIEvent = makeEventPreventable(event as Event)
            for (const handler of flatHandlers) {
              handler(baseUIEvent)
              if (baseUIEvent.baseUIHandlerPrevented) {
                break
              }
            }
          }
          else {
            for (const handler of flatHandlers) {
              handler(event)
            }
          }
        }
      }
    }
  }

  return merged
}
