/* eslint-disable node/prefer-global/process */
import type { Ref } from 'vue'
import { computed, ref, watch } from 'vue'
import { error } from './error'

type AnyFunction = (...args: any[]) => any
type NonFunction<T> = T extends AnyFunction ? never : T
type Getter<T> = () => T
type Updater<T> = (prevValue: T) => T
type MaybeGetter<T> = T | Getter<T>

function resolveValue<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as Getter<T>)() : value
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
  setValue: (next: T | Updater<T>) => void
}

/**
 * Manages controlled / uncontrolled state
 * - When `controlled()` returns a non-`undefined` value the component is
 *   considered **controlled** and the internal state is ignored.
 * - When `controlled()` returns `undefined` the component is **uncontrolled**
 *   and the internal ref drives the value.
 */
export function useControllableState<T>(
  params: UseControllableStateParameters<NonFunction<T>>,
): UseControllableStateReturnValue<NonFunction<T>> {
  type State = NonFunction<T>

  const stateName = params.state ?? 'value'
  const componentName = params.name ?? 'component'

  const controlledValue = computed<State | undefined>(() => params.controlled())
  const defaultValue = computed<State>(() => resolveValue(params.default))
  const isControlled = ref(controlledValue.value !== undefined)

  const internalValue = ref<State>(defaultValue.value) as Ref<State>

  const value = computed<State>(() => {
    return isControlled.value
      ? controlledValue.value as State
      : internalValue.value
  })

  if (process.env.NODE_ENV !== 'production') {
    const initialDefaultValue = JSON.stringify(defaultValue.value)

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

  function setValue(next: State | Updater<State>) {
    if (isControlled.value) {
      return
    }

    internalValue.value = typeof next === 'function'
      ? (next as Updater<State>)(internalValue.value)
      : next
  }

  return { value, setValue }
}
