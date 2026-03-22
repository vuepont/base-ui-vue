import type { BaseUIEvent } from '../types'
import { describe, expect, it, vi } from 'vitest'
import { mergeProps, mergePropsN } from './mergeProps'

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

    expect(theirCallOrder).toBeLessThan(ourCallOrder)
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
          log.push('3')
        },
      },
      {
        onClick() {
          log.push('2')
        },
      },
      {
        onClick() {
          log.push('1')
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
          log.push('3')
        },
      },
      {
        onClick: undefined,
      },
      {
        onClick() {
          log.push('1')
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)
    expect(log).toEqual(['1', '3'])
  })

  it('makes a lone synthetic event handler preventable', () => {
    let prevented = false

    const mergedProps = mergeProps(
      {},
      {
        onMousedown(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          prevented = event.baseUIHandlerPrevented === true
        },
      },
    )

    mergedProps.onMousedown?.({ nativeEvent: new MouseEvent('mousedown') } as any)

    expect(prevented).toBe(true)
  })

  it('makes a first-position synthetic event handler preventable', () => {
    let prevented = false

    const mergedProps = mergeProps(
      {
        onMousedown(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          prevented = event.baseUIHandlerPrevented === true
        },
      },
      {
        id: 'test-button',
      },
    )

    mergedProps.onMousedown?.({ nativeEvent: new MouseEvent('mousedown') } as any)

    expect(prevented).toBe(true)
  })

  it('makes a lone obscure synthetic event handler preventable', () => {
    let prevented = false

    const mergedProps = mergeProps(
      {},
      {
        onContextmenu(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          prevented = event.baseUIHandlerPrevented === true
        },
      },
    )

    mergedProps.onContextmenu?.({ nativeEvent: new MouseEvent('contextmenu') } as any)

    expect(prevented).toBe(true)
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

  it('merges classes with rightmost first', () => {
    const theirProps = {
      class: 'external-class',
    }
    const ourProps = {
      class: 'internal-class',
    }
    const mergedProps = mergeProps(ourProps, theirProps)

    expect(mergedProps.class).toBe('external-class internal-class')
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

    expect(mergedProps.class).toBe('class-3 class-2 class-1')
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

  it('does not prevent internal handler if event.preventBaseUIHandler() is not called', () => {
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

  it('prevents internal handler if event.preventBaseUIHandler() is called', () => {
    let ran = false

    const mergedProps = mergeProps(
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
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
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
          log.push('2')
        },
      },
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          log.push('1')
        },
      },
      {
        onClick() {
          log.push('0')
        },
      },
    )

    mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(log).toEqual(['0', '1'])
  })

  it('returns the rightmost handler return value', () => {
    const mergedProps = mergeProps(
      {
        onClick() {
          return 'internal'
        },
      },
      {
        onClick() {
          return 'external'
        },
      },
    )

    const result = mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(result).toBe('external')
  })

  it('returns the preventing handler return value when the chain is stopped', () => {
    const mergedProps = mergeProps(
      {
        onClick() {
          return 'internal'
        },
      },
      {
        onClick(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          return 'preventing-handler'
        },
      },
    )

    const result = mergedProps.onClick?.({ nativeEvent: new MouseEvent('click') } as any)

    expect(result).toBe('preventing-handler')
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
              log.push('0')
            },
          },
        )

        mergedProps.onValueChange(eventArgument)

        expect(log).toEqual(['0', '1'])
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

describe('mergePropsN', () => {
  it('returns an empty object if no props are provided', () => {
    expect(mergePropsN([])).toEqual({})
  })

  it('merges props from an array using the same semantics as mergeProps', () => {
    const mergedProps = mergePropsN([
      {
        class: 'class-1',
        style: { color: 'blue', backgroundColor: 'blue' },
      },
      {
        class: 'class-2',
        style: { color: 'red' },
      },
      {
        class: 'class-3',
      },
    ])

    expect(mergedProps.class).toBe('class-3 class-2 class-1')
    expect(mergedProps.style).toEqual({
      color: 'red',
      backgroundColor: 'blue',
    })
  })

  it('makes a first-position synthetic event handler preventable in mergePropsN', () => {
    let prevented = false

    const mergedProps = mergePropsN([
      {
        onMousedown(event: BaseUIEvent<MouseEvent>) {
          event.preventBaseUIHandler()
          prevented = event.baseUIHandlerPrevented === true
        },
      },
      {
        id: 'test-button',
      },
    ])

    mergedProps.onMousedown?.({ nativeEvent: new MouseEvent('mousedown') } as any)

    expect(prevented).toBe(true)
  })
})
