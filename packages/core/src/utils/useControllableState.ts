/* eslint-disable node/prefer-global/process */
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { error } from './error'

type MaybeGetter<T> = T | (() => T)

function resolveValue<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export interface UseControllableStateParameters<T> {
  /**
   * The controlled value. When not `undefined`, the state is considered controlled.
   */
  controlled: () => T | undefined
  /**
   * The default value used when uncontrolled.
   */
  default: MaybeGetter<T>
  /**
   * The component name displayed in warnings.
   */
  name?: string
  /**
   * The name of the state variable displayed in warnings.
   * @default 'value'
   */
  state?: string
}

export interface UseControllableStateReturnValue<T> {
  value: Readonly<Ref<T>>
  setValue: (next: T | ((prevValue: T) => T)) => void
}

/**
 * Manages controlled / uncontrolled state
 * - When `controlled()` returns a non-`undefined` value the component is
 *   considered **controlled** and the internal state is ignored.
 * - When `controlled()` returns `undefined` the component is **uncontrolled**
 *   and the internal ref drives the value.
 */
export function useControllableState<T>(
  params: UseControllableStateParameters<T>,
): UseControllableStateReturnValue<T> {
  const stateName = params.state ?? 'value'
  const componentName = params.name ?? 'component'

  const controlledValue = computed(() => params.controlled())
  const defaultValue = computed(() => resolveValue(params.default))
  const isControlled = ref(controlledValue.value !== undefined)
  const initialDefaultValue = JSON.stringify(defaultValue.value)

  const internalValue = ref<T>(defaultValue.value) as Ref<T>

  const value = computed<T>(() => {
    return isControlled.value
      ? controlledValue.value as T
      : internalValue.value
  })

  if (process.env.NODE_ENV !== 'production') {
    watch(controlledValue, (nextControlledValue) => {
      const nextIsControlled = nextControlledValue !== undefined

      if (isControlled.value !== nextIsControlled) {
        error(
          `A component is changing the ${isControlled.value ? '' : 'un'}controlled ${stateName} state of ${componentName} to be ${isControlled.value ? 'un' : ''}controlled.`,
          'Elements should not switch from uncontrolled to controlled (or vice versa).',
          `Decide between using a controlled or uncontrolled ${componentName} element for the lifetime of the component.`,
          'The nature of the state is determined during the first render. It\'s considered controlled if the value is not `undefined`.',
        )
      }
    })

    watch(defaultValue, (nextDefaultValue) => {
      if (
        !isControlled.value
        && JSON.stringify(nextDefaultValue) !== initialDefaultValue
      ) {
        error(
          `A component is changing the default ${stateName} state of an uncontrolled ${componentName} after being initialized.`,
          `To suppress this warning opt to use a controlled ${componentName}.`,
        )
      }
    })
  }

  function setValue(next: T | ((prevValue: T) => T)) {
    if (isControlled.value) {
      return
    }

    internalValue.value = typeof next === 'function'
      ? (next as (prevValue: T) => T)(internalValue.value)
      : next
  }

  return { value, setValue }
}
