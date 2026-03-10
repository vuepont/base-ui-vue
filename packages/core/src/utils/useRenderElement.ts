import type {
  Component,
  ComponentPublicInstance,
  ComputedRef,
  Ref,
  StyleValue,
} from 'vue'
import type { StateAttributesMapping } from './getStateAttributesProps'
import { computed, unref } from 'vue'
import { mergeClasses, mergeObjects } from '../merge-props/mergeProps'
import { EMPTY_OBJECT } from './constants'
import { getStateAttributesProps } from './getStateAttributesProps'
import { Slot } from './slot'
import { useMergedRefs } from './useMergedRefs'

export type RenderRef
  = | Ref<HTMLElement | ComponentPublicInstance | null>
    | ((el: Element | ComponentPublicInstance | null) => void)
    | null

export interface UseRenderElementParams<State extends Record<string, any>> {
  /**
   * The component's own props (`as`, `class`, `style`).
   * `class` and `style` can be functions that accept the state and return the resolved value.
   */
  componentProps: {
    as?: string | Component
    class?: any | ((state: State) => any)
    style?: StyleValue | ((state: State) => StyleValue)
  }
  /**
   * The state of the component.
   * State properties are automatically converted to `data-*` attributes.
   */
  state: ComputedRef<State> | Ref<State>
  /**
   * Intrinsic props to be spread on the rendered element.
   * They are merged with state-derived attributes and the component's class/style.
   */
  props?: Record<string, any> | ComputedRef<Record<string, any>>
  /**
   * Custom mapping for converting state properties to `data-*` attributes.
   * @example
   * { isActive: (value) => (value ? { 'data-is-active': '' } : null) }
   */
  stateAttributesMapping?: StateAttributesMapping<State>
  /**
   * The default tag name to use for the rendered element when `as` is not provided.
   * @default 'div'
   */
  defaultTagName?: string
  /**
   * The ref to apply to the rendered element.
   * Wrapped through `useMergedRefs` to produce a component-instance-aware callback ref.
   */
  ref?: RenderRef
}

export interface UseRenderElementReturn<State> {
  /** The resolved tag or component to render. `undefined` in renderless mode. */
  tag: ComputedRef<string | Component | undefined>
  /** All merged attributes (state attrs, intrinsic props, resolved class/style). */
  mergedProps: ComputedRef<Record<string, any>>
  /** Whether the component is in renderless mode (`as` is `Slot`). */
  renderless: ComputedRef<boolean>
  /** The component state, passed through for slot exposure. */
  state: ComputedRef<State> | Ref<State>
  /** A callback ref to bind to the consumer element. `undefined` when no ref is provided. */
  ref?: ((el: Element | ComponentPublicInstance | null) => void) | null
}

/**
 * Renders a Base UI element (internal composable).
 *
 * Assembles state-to-data-attribute conversion, class/style resolution,
 * and ref wrapping into a single composable used by all polymorphic components.
 *
 * @param params - The render element parameters.
 */
export function useRenderElement<State extends Record<string, any>>(
  params: UseRenderElementParams<State>,
): UseRenderElementReturn<State> {
  const renderless = computed(() => params.componentProps.as === Slot)

  const tag = computed(() => {
    if (renderless.value) {
      return undefined
    }
    return params.componentProps.as ?? params.defaultTagName ?? 'div'
  })

  const mergedProps = computed(() => {
    const state = unref(params.state)
    const rawProps = unref(params.props) ?? EMPTY_OBJECT
    const stateAttrs = getStateAttributesProps(
      state,
      params.stateAttributesMapping,
    )

    const merged: Record<string, any> = {
      ...stateAttrs,
      ...rawProps,
    }

    const resolvedClass
      = typeof params.componentProps.class === 'function'
        ? params.componentProps.class(state)
        : params.componentProps.class
    const resolvedStyle
      = typeof params.componentProps.style === 'function'
        ? params.componentProps.style(state)
        : params.componentProps.style

    if (resolvedClass !== undefined) {
      merged.class = normalizeClass(merged.class, resolvedClass)
    }

    if (resolvedStyle !== undefined) {
      merged.style = normalizeStyle(merged.style, resolvedStyle)
    }

    return merged
  })

  return {
    tag,
    mergedProps,
    renderless,
    state: params.state,
    ref: params.ref ? useMergedRefs(params.ref) : undefined,
  }
}

function normalizeClass(currentValue: unknown, nextValue: unknown) {
  if (currentValue == null) {
    return nextValue
  }
  if (nextValue == null) {
    return currentValue
  }
  if (typeof currentValue === 'string' && typeof nextValue === 'string') {
    return mergeClasses(currentValue, nextValue)
  }
  return [currentValue, nextValue]
}

function normalizeStyle(currentValue: unknown, nextValue: StyleValue) {
  if (currentValue == null) {
    return nextValue
  }
  if (nextValue == null) {
    return currentValue
  }
  if (isPlainObject(currentValue) && isPlainObject(nextValue)) {
    return mergeObjects(currentValue, nextValue)
  }
  return [currentValue, nextValue]
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}
