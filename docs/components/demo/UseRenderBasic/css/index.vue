<script setup lang="ts">
import { useRender } from 'base-ui-vue'
import { defineComponent, h, mergeProps } from 'vue'
import './styles.css'

const CustomText = defineComponent({
  name: 'CustomText',
  inheritAttrs: false,
  props: { as: { type: [String, Object], default: undefined } },
  setup(props, { attrs, slots }) {
    const element = useRender({
      defaultTagName: 'p',
      ...props,
      props: mergeProps({
        class: 'Text',
      }, attrs),
    })

    return () => {
      if (element.renderless.value) {
        return slots.default?.()
      }
      return h(element.tag.value as any, element.renderProps.value, slots.default?.())
    }
  },
})
</script>

<template>
  <div>
    <CustomText>Text component rendered as a paragraph tag</CustomText>
    <CustomText as="strong">
      Text component rendered as a strong tag
    </CustomText>
  </div>
</template>
