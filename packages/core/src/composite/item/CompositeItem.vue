<script setup lang="ts" generic="Metadata, State extends Record<string, any> = Record<string, any>">
import type { StateAttributesMapping } from '../../utils/getStateAttributesProps'
import type { BaseUIComponentProps } from '../../utils/types'
import { computed, useAttrs } from 'vue'
import { EMPTY_OBJECT } from '../../utils/constants'
import { getStateAttributesProps } from '../../utils/getStateAttributesProps'
import { useCompositeItem } from './useCompositeItem'

export interface CompositeItemProps<Metadata, State extends Record<string, any>> extends Pick<
  BaseUIComponentProps<State>,
  'class'
> {
  as?: string | any
  style?: BaseUIComponentProps<State>['style']
  metadata?: Metadata
  refs?: Array<HTMLElement | null>
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

const mergedProps = computed(() => {
  const stateAttributes = getStateAttributesProps(props.state, props.stateAttributesMapping)

  let externalProps = {}

  if (props.props) {
    props.props.forEach((prop) => {
      const p = typeof prop === 'function' ? prop() : prop
      externalProps = { ...externalProps, ...p }
    })
  }

  return {
    ...attrs,
    ...externalProps,
    ...compositeProps.value,
    ...stateAttributes,
    class: typeof props.class === 'function' ? props.class(props.state) : props.class,
    style: typeof props.style === 'function' ? props.style(props.state) : props.style,
  }
})
</script>

<template>
  <component :is="props.as" :ref="compositeRef" v-bind="mergedProps">
    <slot />
  </component>
</template>
