import type { Component, ComponentPublicInstance, ComputedRef, Ref } from 'vue'
import type { useRender } from './useRender'
import { expectTypeOf } from 'vitest'

describe('useRender types', () => {
  describe('returnValue', () => {
    it('has the correct shape', () => {
      expectTypeOf<useRender.ReturnValue<{ active: boolean }>>().toExtend<{
        tag: ComputedRef<string | Component | undefined>
        renderProps: ComputedRef<Record<string, any>>
        renderless: ComputedRef<boolean>
        state: ComputedRef<Readonly<{ active: boolean }>>
        ref?: ((el: Element | null) => void) | undefined
      }>()
    })

    it('state is readonly', () => {
      type State = useRender.ReturnValue<{ active: boolean }>['state']
      expectTypeOf<State>().toEqualTypeOf<ComputedRef<Readonly<{ active: boolean }>>>()
    })
  })

  describe('componentProps', () => {
    it('includes as, class, and style from BaseUIComponentProps', () => {
      expectTypeOf<useRender.ComponentProps<{ active: boolean }>>().toExtend<{
        as?: string | Component
        class?: any
        style?: any
      }>()
    })

    it('merges additional props', () => {
      expectTypeOf<
        useRender.ComponentProps<{ active: boolean }, { disabled?: boolean }>
      >().toExtend<{
        as?: string | Component
        disabled?: boolean
      }>()
    })
  })

  describe('elementProps', () => {
    it('constrains to native tag props when a tag is given', () => {
      type ButtonProps = useRender.ElementProps<'button'>
      expectTypeOf<NonNullable<ButtonProps['type']>>().toBeString()
      // disabled is Booleanish (string | number | boolean) in Vue's type system
      expectTypeOf<ButtonProps>().toHaveProperty('disabled')
    })

    it('falls back to HTMLProps when no tag is given', () => {
      expectTypeOf<useRender.ElementProps>().toExtend<{
        class?: any
        style?: any
      }>()
    })

    it('merges additional props with the tag props', () => {
      type Props = useRender.ElementProps<'button', { 'data-custom'?: string }>
      expectTypeOf<NonNullable<Props['type']>>().toBeString()
      expectTypeOf<NonNullable<Props['data-custom']>>().toBeString()
    })
  })

  describe('parameters', () => {
    it('accepts the correct shape', () => {
      expectTypeOf<useRender.Parameters<{ active: boolean }>>().toExtend<{
        defaultTagName?: string
        as?: string | Component
        state?: any
        props?: any
        class?: any
        style?: any
        ref?: useRender.RenderRef
      }>()
    })
  })

  describe('renderRef', () => {
    it('accepts a Ref<HTMLElement | null>', () => {
      // Type assignment verifies assignability at compile time
      const _: useRender.RenderRef = null! as Ref<HTMLElement | null>
      expectTypeOf(_).not.toBeNever()
    })

    it('accepts a callback ref', () => {
      const _: useRender.RenderRef = null! as ((el: Element | ComponentPublicInstance | null) => void)
      expectTypeOf(_).not.toBeNever()
    })
  })
})
