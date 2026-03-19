import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { useMergedRefs } from './useMergedRefs'

describe('useMergedRefs', () => {
  it('returns a single ref-setter function that forks the ref to its inputs', async () => {
    const outerRef = ref<HTMLDivElement | null>(null)

    const Component = defineComponent({
      setup() {
        const ownRef = ref<HTMLDivElement | null>(null)
        const handleRef = useMergedRefs(outerRef, ownRef)

        return { handleRef, ownRef }
      },
      template: `<div :ref="handleRef" data-testid="target">{{ ownRef ? 'has a ref' : 'has no ref' }}</div>`,
    })

    render(Component)
    await nextTick()

    expect(screen.getByTestId('target').textContent).toBe('has a ref')
    expect(outerRef.value).not.toBeNull()
    expect(outerRef.value!.textContent).toBe('has a ref')
  })

  it('forks if only one of the branches requires a ref', async () => {
    const Component = defineComponent({
      setup() {
        const hasRef = ref(false)
        const handleOwnRef = () => {
          hasRef.value = true
        }
        const handleRef = useMergedRefs(handleOwnRef, null)

        return { handleRef, hasRef }
      },
      template: `<div :ref="handleRef" data-testid="hasRef">{{ String(hasRef) }}</div>`,
    })

    render(Component)
    await nextTick()
    expect(screen.getByTestId('hasRef').textContent).toBe('true')
  })

  it('returns undefined if none of the forked branches requires a ref', () => {
    const result = useMergedRefs(null, undefined, null)
    expect(result).toBeUndefined()
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
      template: `<Child :ref="handleRef" />`,
    })

    render(Parent)

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

    // Ref object should be set to null
    expect(objRef.value).toBeNull()
    // Callback ref should be called with null
    expect(fnRef).toHaveBeenCalledTimes(2)
    expect(fnRef.mock.calls[1][0]).toBeNull()
  })

  it('calls cleanup function if it exists', () => {
    const cleanup = vi.fn()
    const setup = vi.fn()
    const setup2 = vi.fn()
    const nullHandler = vi.fn()

    function onRefChangeWithCleanup(el: Element | null) {
      if (el) {
        setup(el.id)
      }
      else {
        nullHandler()
      }
      return cleanup
    }

    function onRefChangeWithoutCleanup(el: Element | null) {
      if (el) {
        setup2(el.id)
      }
      else {
        nullHandler()
      }
    }

    const Component = defineComponent({
      setup() {
        const handleRef = useMergedRefs(
          onRefChangeWithCleanup as any,
          onRefChangeWithoutCleanup as any,
        )
        return { handleRef }
      },
      template: `<div id="test" :ref="handleRef" />`,
    })

    const { unmount } = render(Component)

    // Both setup fns should have been called with the element id
    expect(setup).toHaveBeenCalledTimes(1)
    expect(setup.mock.calls[0][0]).toBe('test')
    expect(cleanup).toHaveBeenCalledTimes(0)

    expect(setup2).toHaveBeenCalledTimes(1)
    expect(setup2.mock.calls[0][0]).toBe('test')

    unmount()

    // Setup was not called again
    expect(setup).toHaveBeenCalledTimes(1)
    // Cleanup WAS called because onRefChangeWithCleanup returned it
    expect(cleanup).toHaveBeenCalledTimes(1)

    // Setup2 was not called again
    expect(setup2).toHaveBeenCalledTimes(1)
    // nullHandler was called because onRefChangeWithoutCleanup has no cleanup
    expect(nullHandler).toHaveBeenCalledTimes(1)
  })
})
