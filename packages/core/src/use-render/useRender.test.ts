import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, isReadonly, ref } from 'vue'
import { Slot } from '../utils/slot'
import { useRender } from './useRender'

describe('useRender', () => {
  it('collects attrs internally and merges them with explicit props', () => {
    const TestComponent = defineComponent({
      inheritAttrs: false,
      setup() {
        const { tag, renderProps, renderless, state, ref } = useRender({
          defaultTagName: 'div',
          props: {
            id: 'explicit-id',
          },
          state: computed(() => ({ active: true })),
          class: (currentState: { active: boolean }) =>
            currentState.active ? 'from-state' : undefined,
        })

        return { tag, renderProps, renderless, state, ref }
      },
      template: `
        <slot v-if="renderless" :props="renderProps" :state="state" :ref="ref" />
        <component v-else :is="tag" :ref="ref" v-bind="renderProps">
          <slot :state="state" />
        </component>
      `,
    })

    const { container } = render(TestComponent, {
      attrs: {
        'data-from-attrs': 'yes',
      },
    })

    const element = container.firstElementChild as HTMLElement
    expect(element).toHaveAttribute('id', 'explicit-id')
    expect(element).toHaveAttribute('data-from-attrs', 'yes')
    expect(element).toHaveAttribute('data-active')
    expect(element).toHaveClass('from-state')
  })

  it('returns readonly state and supports renderless mode', () => {
    let readonlyState = false

    const TestComponent = defineComponent({
      inheritAttrs: false,
      setup() {
        const { renderProps, renderless, state, ref } = useRender({
          as: Slot,
          state: computed(() => ({ active: true })),
          props: {
            'data-testid': 'renderless-root',
          },
        })

        readonlyState = isReadonly(state.value)

        return { renderProps, renderless, state, ref }
      },
      template: `
        <slot v-if="renderless" :props="renderProps" :state="state" :ref="ref" />
      `,
    })

    render(TestComponent, {
      slots: {
        default: `
          <template #default="{ props, state }">
            <span v-bind="props">{{ state.active ? 'on' : 'off' }}</span>
          </template>
        `,
      },
    })

    expect(readonlyState).toBe(true)
    expect(screen.getByTestId('renderless-root')).toHaveTextContent('on')
  })

  describe('param: defaultTagName', () => {
    it('renders div by default if no defaultTagName and no as are provided', () => {
      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({})
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" />`,
      })

      const { container } = render(TestComponent)
      expect(container.firstElementChild).toHaveProperty('tagName', 'DIV')
    })

    it('renders the element with the specified default tag', () => {
      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({ defaultTagName: 'span' })
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" />`,
      })

      const { container } = render(TestComponent)
      expect(container.firstElementChild).toHaveProperty('tagName', 'SPAN')
    })

    it('as prop overrides the default tag', () => {
      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({
            defaultTagName: 'div',
            as: 'span',
          })
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" />`,
      })

      const { container } = render(TestComponent)
      expect(container.firstElementChild).toHaveProperty('tagName', 'SPAN')
    })
  })

  describe('state to data attributes', () => {
    function createStateTestComponent(
      state: Record<string, any>,
      extraProps?: Record<string, any>,
    ) {
      return defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({
            state: computed(() => state),
            props: extraProps,
          })
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" data-testid="target" />`,
      })
    }

    it('converts state to data attributes automatically', () => {
      const { container } = render(
        createStateTestComponent({ active: true, index: 42 }),
      )
      const el = container.firstElementChild
      expect(el).toHaveAttribute('data-active', '')
      expect(el).toHaveAttribute('data-index', '42')
    })

    it('handles undefined values in state', () => {
      const { container } = render(
        createStateTestComponent({ defined: 'value', notDefined: undefined }),
      )
      const el = container.firstElementChild
      expect(el).toHaveAttribute('data-defined', 'value')
      expect(el).not.toHaveAttribute('data-notdefined')
    })

    it('merges state-based data attributes with existing props', () => {
      const { container } = render(
        createStateTestComponent(
          { form: 'login' },
          { 'class': 'btn-primary', 'id': 'submit-btn', 'data-existing': 'prop' },
        ),
      )
      const el = container.firstElementChild
      expect(el).toHaveAttribute('data-form', 'login')
      expect(el).toHaveAttribute('id', 'submit-btn')
      expect(el).toHaveAttribute('data-existing', 'prop')
    })

    it('props override state-based data attributes', () => {
      const { container } = render(
        createStateTestComponent({ active: true }, { 'data-active': 'false' }),
      )
      expect(container.firstElementChild).toHaveAttribute(
        'data-active',
        'false',
      )
    })

    it('handles empty state', () => {
      const { container } = render(createStateTestComponent({}))
      const el = container.firstElementChild!
      const attrs = el.attributes
      for (let i = 0; i < attrs.length; i += 1) {
        if (attrs[i].name !== 'data-testid') {
          expect(attrs[i].name).not.toMatch(/^data-/)
        }
      }
    })

    it('handles undefined state', () => {
      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({
            state: undefined,
            props: { 'class': 'test-class', 'data-from-props': 'value' },
          })
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" />`,
      })

      const { container } = render(TestComponent)
      const el = container.firstElementChild
      expect(el).toHaveAttribute('class', 'test-class')
      expect(el).toHaveAttribute('data-from-props', 'value')
    })

    it('converts boolean values in state to data attributes', () => {
      const { container } = render(
        createStateTestComponent({ active: true, disabled: false }),
      )
      const el = container.firstElementChild
      expect(el).toHaveAttribute('data-active', '')
      expect(el).not.toHaveAttribute('data-disabled')
    })
    it('converts number values in state to data attributes', () => {
      const { container } = render(
        createStateTestComponent({ count: 0, index: 42, percentage: 99.9 }),
      )
      const el = container.firstElementChild
      expect(el).toHaveAttribute('data-count', '0')
      expect(el).toHaveAttribute('data-index', '42')
      expect(el).toHaveAttribute('data-percentage', '99.9')
    })

    it('supports custom stateAttributesMapping for kebab-case conversion', () => {
      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({
            state: computed(() => ({
              isActive: true,
              itemCount: 5,
              userName: 'John',
            })),
            stateAttributesMapping: {
              isActive: (value: boolean) =>
                value ? { 'data-is-active': '' } : null,
              itemCount: (value: number) => ({
                'data-item-count': value.toString(),
              }),
              userName: (value: string) => ({ 'data-user-name': value }),
            },
          })
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" />`,
      })

      const { container } = render(TestComponent)
      expect(container.firstElementChild).toHaveAttribute('data-is-active', '')
      expect(container.firstElementChild).toHaveAttribute(
        'data-item-count',
        '5',
      )
      expect(container.firstElementChild).toHaveAttribute(
        'data-user-name',
        'John',
      )
    })
  })

  describe('merge precedence', () => {
    it('stateAttrs < attrs < props < class/style', () => {
      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const { tag, renderProps } = useRender({
            state: computed(() => ({ active: true })),
            props: {
              'data-active': 'from-props',
            },
            class: 'from-class-prop',
            style: { color: 'red' },
          })
          return { tag, renderProps }
        },
        template: `<component :is="tag" v-bind="renderProps" />`,
      })

      const { container } = render(TestComponent, {
        attrs: {
          'data-from-attrs': 'yes',
        },
      })

      const el = container.firstElementChild as HTMLElement
      // props override state attrs (data-active='from-props' not '')
      expect(el).toHaveAttribute('data-active', 'from-props')
      // attrs collected internally
      expect(el).toHaveAttribute('data-from-attrs', 'yes')
      // class from class prop
      expect(el).toHaveClass('from-class-prop')
      // style from style prop
      expect(el).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    })
  })

  describe('ref handling', () => {
    it('forwards ref through useRender', () => {
      let internalRef: { value: HTMLElement | null } | undefined

      const TestComponent = defineComponent({
        inheritAttrs: false,
        setup() {
          const targetRef = ref<HTMLElement | null>(null)
          internalRef = targetRef

          const {
            tag,
            renderProps,
            ref: renderRef,
          } = useRender({
            defaultTagName: 'button',
            ref: targetRef,
          })

          return { tag, renderProps, renderRef }
        },
        template: `<component :is="tag" :ref="renderRef" v-bind="renderProps" data-testid="ref-target" />`,
      })

      render(TestComponent)
      expect(internalRef?.value).toBe(screen.getByTestId('ref-target'))
    })
  })
})
