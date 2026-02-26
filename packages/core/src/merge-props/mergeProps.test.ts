import type { BaseUIEvent } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { mergeProps } from './mergeProps'

describe('mergeProps', () => {
  it('merges event handlers', () => {
    const theirProps = {
      onClick: vi.fn(),
      onKeydown: vi.fn(),
    }
    const ourProps = {
      onClick: vi.fn(),
      onPaste: vi.fn(),
    }
    const mergedProps = mergeProps(ourProps, theirProps)

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)
    mergedProps.onKeydown?.({
      nativeEvent: new KeyboardEvent('keydown'),
    } as any)
    mergedProps.onPaste?.({ nativeEvent: new Event('paste') } as any)

    // In Vue implementation, ourProps runs first
    expect(ourProps.onClick).toHaveBeenCalled()
    expect(theirProps.onClick).toHaveBeenCalled()
    expect(theirProps.onKeydown).toHaveBeenCalled()
    expect(ourProps.onPaste).toHaveBeenCalled()
  })

  it('merges multiple event handlers', () => {
    const log: string[] = []

    const mergedProps = mergeProps(
      {
        onClick() {
          log.push('1') // Our
        },
      },
      {
        onClick() {
          log.push('2') // Their
        },
      },
      {
        onClick() {
          log.push('3') // Their their
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)
    // Vue mergeProps currently evaluates left-to-right natively
    expect(log).toEqual(['1', '2', '3'])
  })

  it('merges undefined event handlers', () => {
    const log: string[] = []

    const mergedProps = mergeProps(
      {
        onClick() {
          log.push('1')
        },
      },
      {
        onClick: undefined,
      },
      {
        onClick() {
          log.push('3')
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)
    expect(log).toEqual(['1', '3'])
  })

  it('merges styles', () => {
    const theirProps = {
      style: { color: 'red' },
    }
    const ourProps = {
      style: { color: 'blue', backgroundColor: 'blue' },
    }
    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.style).toEqual({
      color: 'red',
      backgroundColor: 'blue',
    })
  })

  it('merges styles with undefined', () => {
    const theirProps = {
      style: { color: 'red' },
    }
    const ourProps = {}

    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.style).toEqual({
      color: 'red',
    })
  })

  it('does not merge styles if both are undefined', () => {
    const theirProps = {}
    const ourProps = {}
    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.style).toBeUndefined()
  })

  it('merges classes properly', () => {
    const theirProps = {
      class: 'external-class', // Using standard Vue 'class'
    }
    const ourProps = {
      class: 'internal-class',
    }
    const mergedProps = mergeProps(ourProps, theirProps)

    // Vue merges rightmost to leftmost in space separated sequence
    expect(mergedProps.class).toBe('external-class internal-class')
  })

  it('merges classes with undefined', () => {
    const theirProps = {
      class: 'external-class',
    }
    const ourProps = {}

    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.class).toBe('external-class')
  })

  it('does not merge classes if both are undefined', () => {
    const theirProps = {}
    const ourProps = {}
    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.class).toBeUndefined()
  })

  it('does not prevent external handler if preventBaseUIHandler is NOT called', () => {
    let ran = false

    const mergedProps = mergeProps(
      {
        onClick() {
          // Standard handler
        },
      },
      {
        onClick() {
          ran = true
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(ran).toBe(true)
  })

  it('prevents external handler if preventBaseUIHandler IS called by our handler', () => {
    let ran = false

    const mergedProps = mergeProps(
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler() // We prevent it
        },
      },
      {
        onClick() {
          ran = true // Should not run
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(ran).toBe(false)
  })

  it('merges internal props so that the ones defined later override earlier ones', () => {
    const mergedProps = mergeProps(
      {
        title: 'internal title 1',
      },
      {
        title: 'internal title 2',
      },
      {},
    )

    expect(mergedProps.title).toBe('internal title 2')
  })

  it('sets baseUIHandlerPrevented to true after calling preventBaseUIHandler()', () => {
    let observedFlag: boolean | undefined

    const mergedProps = mergeProps(
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          observedFlag = event.baseUIHandlerPrevented
        },
      },
      { onClick: () => {} },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(observedFlag).toBe(true)
  })
})
