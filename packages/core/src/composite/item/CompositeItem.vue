<script setup lang="ts" generic="Metadata, State extends Record<string, any> = Record<string, any>">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../../utils/types'
import type { RenderRef } from '../../utils/useRenderElement'
import { computed, useAttrs } from 'vue'
import { mergeProps } from '../../merge-props/mergeProps'
import { EMPTY_OBJECT } from '../../utils/constants'
import { useMergedRefs } from '../../utils/useMergedRefs'
import { useRenderElement } from '../../utils/useRenderElement'
import { useCompositeItem } from './useCompositeItem'

export interface CompositeItemProps<Metadata, State extends Record<string, any>> extends Pick<
  BaseUIComponentProps<State>,
  'class'
> {
  as?: string | any
  style?: BaseUIComponentProps<State>['style']
  metadata?: Metadata
  refs?: RenderRef[]
  props?: Array<Record<string, any> | (() => Record<string, any>)>
  stateAttributesMapping?: StateAttributesMapping<State>
  state?: State
}

defineOptions({
  name: 'BaseUICompositeItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<CompositeItemProps<Metadata, State>>(), {
  as: 'div',
  state: () => EMPTY_OBJECT as State,
})

const attrs = useAttrs()

const { compositeProps, compositeRef } = useCompositeItem({
  metadata: () => props.metadata,
})

const externalProps = computed(() => {
  let externalProps = {}

  if (props.props) {
    props.props.forEach((prop) => {
      const p = typeof prop === 'function' ? prop() : prop
      externalProps = mergeProps(externalProps, p)
    })
  }

  return mergeProps(attrs, externalProps, compositeProps.value)
})

const {
  tag,
  mergedProps,
  renderless,
  ref: renderRef,
} = useRenderElement({
  componentProps: props,
  state: computed(() => props.state),
  props: externalProps,
  stateAttributesMapping: props.stateAttributesMapping,
  defaultTagName: 'div',
  ref: props.refs?.length ? useMergedRefs(...props.refs, compositeRef) : compositeRef,
})
</script>

<template>
  <slot v-if="renderless" :ref="renderRef" :props="mergedProps" :state="props.state" />
  <component :is="tag" v-else :ref="renderRef" v-bind="mergedProps">
    <slot :state="props.state" />
  </component>
</template>
