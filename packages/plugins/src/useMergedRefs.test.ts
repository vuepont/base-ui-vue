/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { useMergedRefs } from './useMergedRefs'

describe('useMergedRefs', () => {
  it('returns a single ref-setter function that forks the ref to its inputs', async () => {
    let outerRefCurrent: Element | null = null

    const outerRef = (el: Element | null) => {
      outerRefCurrent = el
    }

    const Component = defineComponent({
      props: ['innerRef'],
      setup(props) {
        const ownRef = ref<HTMLDivElement | null>(null)
        const handleRef = useMergedRefs(props.innerRef as any, ownRef)

        return { handleRef, ownRef }
      },
      template: `<div :ref="handleRef" data-testid="target">{{ ownRef ? 'has a ref' : 'has no ref' }}</div>`,
    })

    render(Component, {
      props: { innerRef: outerRef },
    })

    await nextTick()

    // ownRef should have been assigned and triggered a re-render
    expect(screen.getByTestId('target').textContent).toBe('has a ref')

    // outerRef should have been called with the same element
    expect(outerRefCurrent).not.toBeNull()
    expect((outerRefCurrent as Element).tagName).toBe('DIV')
  })

  it('forks if only one of the branches requires a ref', async () => {
    const Component = defineComponent({
      setup() {
        const hasRef = ref(false)
        const handleOwnRef = () => {
          hasRef.value = true
        }
        const nullRef = null
        const handleRef = useMergedRefs(handleOwnRef, nullRef)

        return { handleRef, hasRef }
      },
      template: `<div :ref="handleRef" data-testid="hasRef">{{ String(hasRef) }}</div>`,
    })

    render(Component)
    await nextTick()
    expect(screen.getByTestId('hasRef').textContent).toBe('true')
  })

  it('handles unwrapping component instances to get the $el', async () => {
    const innerRef = ref<Element | null>(null)

    const Child = defineComponent({
      template: `<span data-testid="child-span">child</span>`,
    })

    const Parent = defineComponent({
      components: { Child },
      setup() {
        const handleRef = useMergedRefs(innerRef)
        return { handleRef }
      },
      template: `<Child :ref="handleRef" />`, // Component template ref normally returns ComponentPublicInstance
    })

    render(Parent)

    // useMergedRefs should extract the $el property from the component
    expect(innerRef.value).not.toBeNull()
    expect(innerRef.value?.tagName).toBe('SPAN')
    expect(innerRef.value?.textContent).toBe('child')
  })

  it('cleans up refs when component unmounts', async () => {
    const fnRef = vi.fn()
    const objRef = ref<Element | null>(null)

    const Component = defineComponent({
      setup() {
        const handleRef = useMergedRefs(fnRef, objRef)
        return { handleRef }
      },
      template: `<div :ref="handleRef" data-testid="target"></div>`,
    })

    const { unmount } = render(Component)

    expect(objRef.value).not.toBeNull()
    expect((objRef.value as Element).tagName).toBe('DIV')

    expect(fnRef).toHaveBeenCalledTimes(1)
    expect(fnRef.mock.calls[0][0].tagName).toBe('DIV')

    unmount()

    // Vue sets template refs to null on unmount
    expect(objRef.value).toBeNull()
    expect(fnRef).toHaveBeenCalledTimes(2)
    expect(fnRef.mock.calls[1][0]).toBeNull()
  })
})
