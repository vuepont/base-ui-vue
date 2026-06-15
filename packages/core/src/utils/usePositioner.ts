import type { ComputedRef, MaybeRefOrGetter, Ref, StyleValue } from 'vue'
import type { RenderRef, UseRenderElementComponentProps } from './useRenderElement'
import type { TransitionStatus } from './useTransitionStatus'
import { computed, toValue } from 'vue'
import { mergeProps } from '../merge-props/mergeProps'
import { getDisabledMountTransitionStyles } from './getDisabledMountTransitionStyles'
import { popupStateMapping } from './popupStateMapping'
import { useRenderElement } from './useRenderElement'

interface UsePositionerOptions {
  styles: MaybeRefOrGetter<StyleValue>
  transitionStatus: MaybeRefOrGetter<TransitionStatus>
  props?: MaybeRefOrGetter<Record<string, any> | undefined>
  refs?: RenderRef | undefined
  hidden?: MaybeRefOrGetter<boolean | undefined>
  inert?: MaybeRefOrGetter<boolean | undefined>
}

/**
 * Renders the shared outer Positioner element used by popup components.
 * Applies the common role, hidden state, transition styles, state attributes, and optional inert styling.
 */
export function usePositioner<State extends Record<string, any>>(
  componentProps: UseRenderElementComponentProps<State>,
  state: ComputedRef<State> | Ref<State>,
  {
    styles,
    transitionStatus,
    props,
    refs,
    hidden,
    inert = false,
  }: UsePositionerOptions,
) {
  const positionerProps = computed(() => {
    const isInert = toValue(inert) ?? false

    return mergeProps(
      {
        role: 'presentation',
        hidden: toValue(hidden) ? '' : undefined,
        inert: isInert ? '' : undefined,
        style: [
          toValue(styles),
          isInert ? { pointerEvents: 'none' } : undefined,
        ],
      },
      getDisabledMountTransitionStyles(toValue(transitionStatus)),
      toValue(props),
    )
  })

  return useRenderElement({
    componentProps,
    state,
    props: positionerProps,
    stateAttributesMapping: popupStateMapping,
    defaultTagName: 'div',
    ref: refs,
  })
}
