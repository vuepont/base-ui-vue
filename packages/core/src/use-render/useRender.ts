import type {
  Component,
  ComponentPublicInstance,
  ComputedRef,
  MaybeRefOrGetter,
  Ref,
  StyleValue,
} from 'vue'
import type { StateAttributesMapping } from '../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../utils/types'
import { computed, readonly, toValue, useAttrs } from 'vue'
import { mergeProps } from '../merge-props'
import { EMPTY_OBJECT } from '../utils/constants'
import { useRenderElement } from '../utils/useRenderElement'

export interface UseRenderParams<State extends Record<string, any>> {
  /**
   * The default tag name to use for the rendered element when `as` is not provided.
   * @default 'div'
   */
  defaultTagName?: string
  /**
   * The element or component to use for the root node.
   * Pass `Slot` for renderless mode.
   */
  as?: string | Component
  /**
   * Props to be spread on the rendered element.
   * They are merged with the internal props of the component, so that event handlers
   * are merged, class strings and style properties are joined, while other external props
   * overwrite the internal ones.
   */
  props?: Record<string, any>
  /**
   * The state of the component, passed as the second argument to `class` and `style` callbacks.
   * State properties are automatically converted to `data-*` attributes.
   */
  state?: MaybeRefOrGetter<State | undefined>
  /**
   * Custom mapping for converting state properties to `data-*` attributes.
   * @example
   * { isActive: (value) => (value ? { 'data-is-active': '' } : null) }
   */
  stateAttributesMapping?: StateAttributesMapping<State>
  /**
   * CSS class applied to the element, or a function that
   * returns a class based on the component's state.
   */
  class?: any | ((state: State) => any)
  /**
   * Style applied to the element, or a function that
   * returns a style object based on the component's state.
   */
  style?: StyleValue | ((state: State) => StyleValue)
  /**
   * The ref to apply to the rendered element.
   */
  ref?:
    | Ref<HTMLElement | ComponentPublicInstance | null>
    | ((el: Element | ComponentPublicInstance | null) => void)
}

export interface UseRenderReturn<State> {
  /** The resolved tag or component to render. `undefined` in renderless mode. */
  tag: ComputedRef<string | Component | undefined>
  /** All merged attributes (state attrs, consumer attrs, intrinsic props, class/style). */
  renderProps: ComputedRef<Record<string, any>>
  /** Whether the component is in renderless mode (`as` is `Slot`). */
  renderless: ComputedRef<boolean>
  /** The component's readonly state. */
  state: ComputedRef<Readonly<State>>
  /** A callback ref to bind to the consumer element. `undefined` when no ref is provided. */
  ref?: ((el: Element | ComponentPublicInstance | null) => void) | null
}

/**
 * Renders a Base UI element.
 *
 * The public composable that collects `attrs` internally via `useAttrs()`,
 * merges them with explicit props, and delegates to `useRenderElement`.
 * Returns a readonly state and supports renderless mode via the `Slot` sentinel.
 *
 * @public
 */
export function useRender<State extends Record<string, any>>(
  params: UseRenderParams<State>,
): UseRenderReturn<State> {
  const attrs = useAttrs()
  const state = computed(() => {
    return readonly(
      toValue(params.state) ?? (EMPTY_OBJECT as State),
    ) as Readonly<State>
  })
  const mergedComponentProps = useRenderElement({
    componentProps: params,
    state,
    props: computed(() =>
      mergeProps(attrs as Record<string, any>, params.props),
    ),
    stateAttributesMapping: params.stateAttributesMapping,
    defaultTagName: params.defaultTagName,
    ref: params.ref,
  })

  return {
    tag: mergedComponentProps.tag,
    renderProps: mergedComponentProps.mergedProps,
    renderless: mergedComponentProps.renderless,
    state,
    ref: mergedComponentProps.ref,
  }
}

// eslint-disable-next-line ts/no-namespace
export namespace useRender {
  export type ComponentProps<State = Record<string, unknown>>
    = BaseUIComponentProps<State>
  export type ElementProps = Record<string, any>
  export type Parameters<State = Record<string, unknown>> = UseRenderParams<
    State extends Record<string, any> ? State : Record<string, any>
  >
  export type ReturnValue<State = Record<string, unknown>>
    = UseRenderReturn<State>
}
