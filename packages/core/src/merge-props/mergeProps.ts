import type { BaseUIEvent } from '../utils/types'
import { normalizeClass, mergeProps as vueMergeProps } from 'vue'

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
 * Merges Vue prop/attr objects using Base UI Vue semantics.
 *
 * Later props overwrite earlier ones, except for:
 * - Event listeners: merged so the rightmost listener runs first and can prevent earlier listeners.
 * - `class`: merged in rightmost-first order.
 * - `style`: merged using Vue's native style merging.
 */
export function mergeProps(
  ...args: (Record<string, any> | undefined)[]
): Record<string, any> {
  const definedArgs = args.filter(
    (arg): arg is Record<string, any> => arg != null,
  )

  const merged = vueMergeProps(...definedArgs)
  const classValue = mergeClassValues(definedArgs)

  if (classValue !== undefined) {
    merged.class = classValue
  }

  for (const propName in merged) {
    if (isEventHandler(propName, merged[propName])) {
      merged[propName] = wrapEventHandlers(merged[propName])
    }
  }

  return merged
}

/**
 * Merges an array of Vue prop/attr objects using the same semantics as {@link mergeProps}.
 *
 * Useful when prop layers are assembled dynamically before being bound with `v-bind`.
 */
export function mergePropsN(
  props: readonly (Record<string, any> | undefined)[],
): Record<string, any> {
  const definedProps = props.filter(
    (prop): prop is Record<string, any> => prop != null,
  )

  if (definedProps.length === 0) {
    return {}
  }

  return mergeProps(...definedProps)
}

function mergeClassValues(args: (Record<string, any> | undefined)[]) {
  const classValues = args
    .map(props => props?.class)
    .filter(value => value != null)

  if (classValues.length === 0) {
    return undefined
  }

  return normalizeClass(classValues.reverse())
}

function wrapEventHandlers(handlers: unknown) {
  if (Array.isArray(handlers)) {
    // Vue may merge listeners into arrays; flatten them so execution order stays predictable.
    const flatHandlers = handlers.flat(Infinity).filter(
      (handler): handler is (...args: unknown[]) => unknown =>
        typeof handler === 'function',
    )

    return (...args: unknown[]) => {
      const preventableArgs = getPreventableArgs(args)

      if (preventableArgs) {
        let result: unknown
        for (let i = flatHandlers.length - 1; i >= 0; i -= 1) {
          const handlerResult = flatHandlers[i](...preventableArgs.args)
          if (result === undefined) {
            result = handlerResult
          }
          if (preventableArgs.event.baseUIHandlerPrevented) {
            break
          }
        }
        return result
      }

      let result: unknown
      for (let i = flatHandlers.length - 1; i >= 0; i -= 1) {
        const handlerResult = flatHandlers[i](...args)
        if (result === undefined) {
          result = handlerResult
        }
      }
      return result
    }
  }

  if (typeof handlers !== 'function') {
    return handlers
  }

  return (...args: unknown[]) => {
    const preventableArgs = getPreventableArgs(args)

    if (preventableArgs) {
      return handlers(...preventableArgs.args)
    }

    return handlers(...args)
  }
}

function getPreventableArgs(args: unknown[]) {
  const eventIndex = args.findIndex(isPreventableEventArg)
  if (eventIndex === -1) {
    return null
  }

  const nextArgs = [...args]
  const event = makeEventPreventable(nextArgs[eventIndex] as Event)
  nextArgs[eventIndex] = event

  return {
    args: nextArgs,
    event,
  }
}

function isPreventableEventArg(value: unknown): value is Event {
  return Boolean(
    value
    && typeof value === 'object'
    && (
      value instanceof Event
      || 'nativeEvent' in value
      || 'preventBaseUIHandler' in value
    ),
  )
}
