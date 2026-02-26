import { render } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import CompositeList from './CompositeList.vue'
import { useCompositeListItem } from './useCompositeListItem'

describe('<CompositeList />', () => {
  describe('prop: elementsRef', () => {
    it('cleans up refs on unmount', async () => {
      const Item = defineComponent({
        setup() {
          const { ref: itemRef } = useCompositeListItem()
          return { itemRef }
        },
        template: '<div :ref="itemRef" />',
      })

      const elementsRef = ref<Array<HTMLElement | null>>([])
      const labelsRef = ref<Array<string | null>>([])

      // Use render function to pass Ref objects directly as props
      // without Vue's template auto-unwrapping
      const App = defineComponent({
        setup() {
          return () =>
            h(CompositeList, { elementsRef, labelsRef }, () => [
              h(Item),
              h(Item),
              h(Item),
            ])
        },
      })

      const { unmount } = render(App)
      await flushPromises()

      expect(elementsRef.value).toHaveLength(3)
      expect(labelsRef.value).toHaveLength(3)

      unmount()

      expect(elementsRef.value).toHaveLength(0)
      expect(labelsRef.value).toHaveLength(0)
    })
  })
})
