export interface BaseUIEvent<T = Event> {
  baseUIHandlerPrevented?: boolean
  preventBaseUIHandler?: () => void
  nativeEvent: T
}

export function makeEventPreventable<T extends Event>(
  event: any,
): BaseUIEvent<T> {
  if (!event.preventBaseUIHandler) {
    event.preventBaseUIHandler = () => {
      event.baseUIHandlerPrevented = true
    }
  }
  return event
}

export function mergeClassNames(
  ourClassName: string | undefined,
  theirClassName: string | undefined,
) {
  if (theirClassName) {
    if (ourClassName) {
      return `${theirClassName} ${ourClassName}`
    }
    return theirClassName
  }
  return ourClassName
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
    && (typeof value === 'function' || typeof value === 'undefined')
  )
}

function mergeEventHandlers(
  ourHandler: Function | undefined,
  theirHandler: Function | undefined,
) {
  if (!theirHandler)
    return ourHandler
  if (!ourHandler)
    return theirHandler

  return (event: Event) => {
    const baseUIEvent = makeEventPreventable(event)

    // Internal (our) handler runs first so disabled guards can prevent
    // external handlers from firing
    ourHandler(baseUIEvent)

    if (!baseUIEvent.baseUIHandlerPrevented) {
      theirHandler(baseUIEvent)
    }

    return undefined
  }
}

/**
 * Merges multiple sets of props.
 * Follows the Base UI pattern: rightmost takes precedence, except for:
 * - Event handlers: Merged, rightmost executes first, can prevent leftmost.
 * - className: Concatenated.
 * - style: Merged.
 */
export function mergeProps(...args: (Record<string, any> | undefined)[]) {
  let merged: Record<string, any> = {}

  for (const props of args) {
    if (!props)
      continue

    for (const propName in props) {
      const value = props[propName]

      switch (propName) {
        case 'style':
          merged[propName] = mergeObjects(merged.style, value)
          break
        case 'class':
        case 'className':
          // In Vue, 'class' is the standard
          merged.class = mergeClassNames(
            merged.class || merged.className,
            value,
          )
          if (propName === 'className')
            delete merged.className
          break
        default:
          if (isEventHandler(propName, value)) {
            merged[propName] = mergeEventHandlers(merged[propName], value)
          }
          else {
            merged[propName] = value
          }
      }
    }
  }

  return merged
}
