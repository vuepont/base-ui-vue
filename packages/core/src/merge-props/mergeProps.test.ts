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

    const ourCallOrder = ourProps.onClick.mock.invocationCallOrder[0]
    const theirCallOrder = theirProps.onClick.mock.invocationCallOrder[0]

    expect(ourCallOrder).toBeLessThan(theirCallOrder)
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
          log.push('1')
        },
      },
      {
        onClick() {
          log.push('2')
        },
      },
      {
        onClick() {
          log.push('3')
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)
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

  it('merges classes natively (leftmost first)', () => {
    const theirProps = {
      class: 'external-class',
    }
    const ourProps = {
      class: 'internal-class',
    }
    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.class).toBe('internal-class external-class')
  })

  it('merges multiple classes', () => {
    const mergedProps = mergeProps(
      {
        class: 'class-1',
      },
      {
        class: 'class-2',
      },
      {
        class: 'class-3',
      },
    )

    expect(mergedProps.class).toBe('class-1 class-2 class-3')
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

  it('does not prevent external handler if event.preventBaseUIHandler is NOT called', () => {
    let ran = false

    const mergedProps = mergeProps(
      {
        onClick() {},
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

  it('prevents external handler if event.preventBaseUIHandler() IS called', () => {
    let ran = false

    const mergedProps = mergeProps(
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
        },
      },
      {
        onClick() {
          ran = true
        },
      },
      {
        onClick() {
          ran = true
        },
      },
    )

    const event = { nativeEvent: new MouseEvent('click') } as any
    mergedProps.onClick?.(event)

    expect(ran).toBe(false)
  })

  it('prevents handlers merged after event.preventBaseUIHandler() is called', () => {
    const log: string[] = []

    const mergedProps = mergeProps(
      {
        onClick() {
          log.push('1')
        },
      },
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          log.push('2')
        },
      },
      {
        onClick() {
          log.push('3')
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(log).toEqual(['1', '2'])
  });

  [true, 13, 'newValue', { key: 'value' }, ['value'], () => 'value'].forEach(
    (eventArgument) => {
      it('handles non-standard event handlers without error', () => {
        const log: string[] = []

        const mergedProps = mergeProps(
          {
            onValueChange() {
              log.push('1')
            },
          },
          {
            onValueChange() {
              log.push('2')
            },
          },
        )

        mergedProps.onValueChange(eventArgument)

        expect(log).toEqual(['1', '2'])
      })
    },
  )

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
