import type { BaseUIEvent } from "../types";

export function makeEventPreventable<T extends Event>(
  event: T,
): BaseUIEvent<T> {
  const baseUIEvent = event as BaseUIEvent<T>;
  if (!baseUIEvent.preventBaseUIHandler) {
    baseUIEvent.preventBaseUIHandler = () => {
      baseUIEvent.baseUIHandlerPrevented = true;
    };
  }
  return baseUIEvent;
}

export function mergeClasses(
  ourClass: string | undefined,
  theirClass: string | undefined,
) {
  if (theirClass) {
    if (ourClass) {
      return `${theirClass} ${ourClass}`;
    }
    return theirClass;
  }
  return ourClass;
}

export function mergeObjects<
  A extends object | undefined,
  B extends object | undefined,
>(a: A, b: B) {
  if (a && !b) return a;
  if (!a && b) return b;
  if (a || b) return { ...a, ...b };
  return undefined;
}

function isEventHandler(key: string, value: unknown) {
  return (
    key.startsWith("on") &&
    key.charCodeAt(2) >= 65 &&
    key.charCodeAt(2) <= 90 &&
    (typeof value === "function" || typeof value === "undefined")
  );
}

function mergeEventHandlers(
  ourHandler: Function | undefined,
  theirHandler: Function | undefined,
) {
  if (!theirHandler) return ourHandler;
  if (!ourHandler) return theirHandler;

  return (event: Event) => {
    const baseUIEvent = makeEventPreventable(event);

    // Internal (our) handler runs first so disabled guards can prevent
    // external handlers from firing
    ourHandler(baseUIEvent);

    if (!baseUIEvent.baseUIHandlerPrevented) {
      theirHandler(baseUIEvent);
    }

    return undefined;
  };
}

/**
 * Merges multiple sets of props.
 * Follows the Base UI pattern: rightmost takes precedence, except for:
 * - Event handlers: Merged, leftmost (internal) executes first, can prevent rightmost.
 * - class: Concatenated.
 * - style: Merged.
 */
export function mergeProps(...args: (Record<string, any> | undefined)[]) {
  const merged: Record<string, any> = {};

  for (const props of args) {
    if (!props) continue;

    for (const propName in props) {
      const value = props[propName];

      switch (propName) {
        case "style":
          merged[propName] = mergeObjects(merged.style, value);
          break;
        case "class":
          merged.class = mergeClasses(merged.class, value);
          break;
        default:
          if (isEventHandler(propName, value)) {
            merged[propName] = mergeEventHandlers(merged[propName], value);
          } else {
            merged[propName] = value;
          }
      }
    }
  }

  return merged;
}
