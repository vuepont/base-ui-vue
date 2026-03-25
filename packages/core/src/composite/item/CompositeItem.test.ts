import { fireEvent, render, screen } from '@testing-library/vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { CompositeRoot } from '../root'
import CompositeItem from './CompositeItem.vue'

describe('<CompositeItem />', () => {
  it('merges compositeRef with props.refs via useMergedRefs and preserves composite interaction behavior', async () => {
    const externalRef = ref<HTMLElement | null>(null)
    const callbackRef = vi.fn()

    const App = defineComponent({
      components: { CompositeRoot, CompositeItem },
      setup() {
        const refsList = [externalRef, callbackRef]
        return {
          callbackRef,
          refsList,
        }
      },
      template: `
        <CompositeRoot>
          <CompositeItem data-testid="1" :refs="refsList">
            1
          </CompositeItem>
          <CompositeItem data-testid="2">
            2
          </CompositeItem>
        </CompositeRoot>
      `,
    })

    const { unmount } = render(App)

    const item1 = screen.getByTestId('1')
    const item2 = screen.getByTestId('2')

    expect(externalRef.value).toBe(item1)
    expect(callbackRef).toHaveBeenCalledWith(item1)

    // Composite behavior proves the internal compositeRef still received the node.
    item1.focus()
    await flushPromises()

    expect(item1).toHaveAttribute('tabindex', '0')
    expect(item2).toHaveAttribute('tabindex', '-1')

    await fireEvent.keyDown(item1, { key: 'ArrowDown' })
    await flushPromises()

    expect(item2).toHaveFocus()
    expect(item2).toHaveAttribute('tabindex', '0')

    unmount()

    expect(externalRef.value).toBeNull()
    expect(callbackRef).toHaveBeenCalledWith(null)
  })
})
