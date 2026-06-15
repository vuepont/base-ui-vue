import type {
  ComponentPublicInstance,
  ComputedRef,
  InjectionKey,
  MaybeRefOrGetter,
  Ref,
  TeleportProps,
} from 'vue'
import type { BaseUIComponentProps } from '../../utils/types'
import type {
  RenderRef,
  UseRenderElementComponentProps,
  UseRenderElementReturn,
} from '../../utils/useRenderElement'
import { computed, inject, isRef, shallowRef, toValue } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { EMPTY_OBJECT } from '../../utils/constants'
import { useBaseUiId } from '../../utils/useBaseUiId'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { createAttribute } from '../utils/createAttribute'

export interface FloatingPortalState {}

export type FloatingPortalTarget = TeleportProps['to']

export type FloatingPortalContainer = MaybeRefOrGetter<FloatingPortalTarget>

export interface FloatingPortalProps<
  State extends Record<string, any> = FloatingPortalState,
> extends BaseUIComponentProps<State> {
  /**
   * A parent element to render the portal element into.
   */
  container?: FloatingPortalContainer
}

export interface FloatingPortal {}

// eslint-disable-next-line ts/no-namespace
export namespace FloatingPortal {
  export type State = FloatingPortalState
  export type Target = FloatingPortalTarget
  export type Container = FloatingPortalContainer
  export type Props<
    State extends Record<string, any> = FloatingPortalState,
  > = FloatingPortalProps<State>
}

export type FloatingPortalFocusManagerState = null | {
  modal: boolean
  open: boolean
  onOpenChange: (
    open: boolean,
    data?: { reason?: string | undefined, event?: Event | undefined },
  ) => void
  domReference: Element | null
  closeOnFocusOut: boolean
}

export interface FloatingPortalContext {
  portalNode: Ref<HTMLElement | null>
  setFocusManagerState: (
    next:
      | FloatingPortalFocusManagerState
      | ((prev: FloatingPortalFocusManagerState) => FloatingPortalFocusManagerState),
  ) => void
  beforeInsideRef: Ref<HTMLSpanElement | null>
  afterInsideRef: Ref<HTMLSpanElement | null>
  beforeOutsideRef: Ref<HTMLSpanElement | null>
  afterOutsideRef: Ref<HTMLSpanElement | null>
}

export const floatingPortalContextKey: InjectionKey<FloatingPortalContext>
  = Symbol('FloatingPortalContext')

export function usePortalContext() {
  return inject(floatingPortalContextKey, null)
}

function resolvePortalTarget(
  target: MaybeRefOrGetter<FloatingPortalTarget> | undefined,
) {
  if (target === undefined) {
    return undefined
  }

  const resolvedTarget = toValue(target)

  return isRef(resolvedTarget) ? resolvedTarget.value : resolvedTarget
}

export interface UseFloatingPortalNodeProps<
  State extends Record<string, any> = FloatingPortalState,
> {
  ref?: RenderRef | undefined
  container?: FloatingPortalContainer | undefined
  to?: MaybeRefOrGetter<FloatingPortalTarget> | undefined
  componentProps?: UseRenderElementComponentProps<State> | undefined
  elementProps?: MaybeRefOrGetter<Record<string, any> | undefined>
  state?: MaybeRefOrGetter<State | undefined>
}

export interface UseFloatingPortalNodeResult<
  State extends Record<string, any> = FloatingPortalState,
> extends UseRenderElementReturn<State> {
  portalNode: Ref<HTMLElement | null>
  portalTarget: ComputedRef<FloatingPortalTarget>
  shouldRender: ComputedRef<boolean>
}

export function useFloatingPortalNode<
  State extends Record<string, any> = FloatingPortalState,
>(
  props: UseFloatingPortalNodeProps<State> = {},
): UseFloatingPortalNodeResult<State> {
  const uniqueId = useBaseUiId()
  const portalContext = usePortalContext()
  const portalNode = shallowRef<HTMLElement | null>(null)
  const portalAttribute = createAttribute('portal')

  const state = computed(() =>
    toValue(props.state) ?? (EMPTY_OBJECT as State),
  )

  const portalTarget = computed<FloatingPortalTarget>(() => {
    const container = resolvePortalTarget(props.container)

    if (container !== undefined) {
      return container
    }

    const explicitTarget = resolvePortalTarget(props.to)

    if (explicitTarget !== undefined) {
      return explicitTarget
    }

    return portalContext?.portalNode.value ?? 'body'
  })

  const shouldRender = computed(() => uniqueId != null && portalTarget.value != null)

  const portalProps = computed(() =>
    mergeProps(
      {
        id: uniqueId,
        [portalAttribute]: '',
      },
      toValue(props.elementProps),
    ),
  )

  const renderElement = useRenderElement({
    componentProps: props.componentProps ?? EMPTY_OBJECT,
    state,
    props: portalProps,
    defaultTagName: 'div',
    ref: useMergedRefs<HTMLElement | ComponentPublicInstance>(
      portalNode,
      props.ref,
    ),
  })

  return {
    ...renderElement,
    portalNode,
    portalTarget,
    shouldRender,
  }
}
