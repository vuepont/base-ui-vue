import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, ref } from 'vue'
import { Slot } from './slot'
import { useRenderElement } from './useRenderElement'

describe('useRenderElement', () => {
  it('renders the default tag and resolves state attrs/class/style', () => {
    const TestComponent = defineComponent({
      setup() {
        const state = computed(() => ({ active: true, count: 2 }))
        const { tag, mergedProps, renderless } = useRenderElement({
          componentProps: {
            class: (currentState: { active: boolean, count: number }) =>
              currentState.active ? 'is-active' : undefined,
            style: (currentState: { active: boolean, count: number }) => ({
              opacity: currentState.active ? '1' : '0',
            }),
          },
          state,
          props: computed(() => ({
            'id': 'target',
            'data-explicit': 'ok',
          })),
          defaultTagName: 'div',
        })

        return { tag, mergedProps, renderless, state }
      },
      template: `
        <slot v-if="renderless" :props="mergedProps" :state="state" />
        <component v-else :is="tag" v-bind="mergedProps" />
      `,
    })

    const { container } = render(TestComponent)

    const element = container.firstElementChild as HTMLElement
    expect(element.tagName).toBe('DIV')
    expect(element).toHaveAttribute('id', 'target')
    expect(element).toHaveAttribute('data-explicit', 'ok')
    expect(element).toHaveAttribute('data-active')
    expect(element).toHaveAttribute('data-count', '2')
    expect(element).toHaveClass('is-active')
    expect(element).toHaveStyle({ opacity: '1' })
  })

  it('uses the as prop instead of the default tag', () => {
    const TestComponent = defineComponent({
      setup() {
        const { tag, mergedProps } = useRenderElement({
          componentProps: { as: 'span' },
          state: computed(() => ({})),
          defaultTagName: 'div',
        })

        return { tag, mergedProps }
      },
      template: `<component :is="tag" v-bind="mergedProps" />`,
    })

    const { container } = render(TestComponent)
    expect(container.firstElementChild?.tagName).toBe('SPAN')
  })

  it('supports renderless mode and forwards a normalized ref through a Vue component root', async () => {
    let internalRef: { value: HTMLElement | null } | undefined

    const WrappedLink = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => h('a', attrs, slots.default?.())
      },
    })

    const TestComponent = defineComponent({
      components: { WrappedLink },
      setup() {
        const targetRef = ref<HTMLElement | null>(null)
        internalRef = targetRef

        const {
          mergedProps,
          renderless,
          state,
          ref: renderRef,
        } = useRenderElement({
          componentProps: { as: Slot },
          state: computed(() => ({ active: true })),
          props: computed(() => ({
            'href': '#target',
            'data-testid': 'wrapped-link',
          })),
          ref: targetRef,
        })

        return { mergedProps, renderless, state, renderRef }
      },
      template: `
        <slot v-if="renderless" :props="mergedProps" :state="state" :ref="renderRef" />
      `,
    })

    const Root = defineComponent({
      components: { TestComponent, WrappedLink },
      setup() {
        return { Slot }
      },
      template: `
        <TestComponent v-slot="{ props, ref }">
          <WrappedLink v-bind="props" :ref="ref">Wrapped</WrappedLink>
        </TestComponent>
      `,
    })

    render(Root)

    const link = screen.getByTestId('wrapped-link')
    expect(link.tagName).toBe('A')
    expect(internalRef?.value).toBe(link)
  })

  describe('state to data attributes', () => {
    function createStateTestComponent(
      state: Record<string, any>,
      extraProps?: Record<string, any>,
    ) {
      return defineComponent({
        setup() {
          const { tag, mergedProps } = useRenderElement({
            componentProps: {},
            state: computed(() => state),
            props: extraProps ? computed(() => extraProps) : undefined,
            defaultTagName: 'div',
          })
          return { tag, mergedProps }
        },
        template: `<component :is="tag" v-bind="mergedProps" data-testid="target" />`,
      })
    }

    it('converts boolean true to empty string attribute', () => {
      const { container } = render(createStateTestComponent({ active: true }))
      expect(container.firstElementChild).toHaveAttribute('data-active', '')
    })

    it('omits boolean false from attributes', () => {
      const { container } = render(
        createStateTestComponent({ disabled: false }),
      )
      expect(container.firstElementChild).not.toHaveAttribute('data-disabled')
    })

    it('converts non-zero numbers to string attributes', () => {
      const { container } = render(
        createStateTestComponent({ index: 42, percentage: 99.9 }),
      )
      expect(container.firstElementChild).toHaveAttribute('data-index', '42')
      expect(container.firstElementChild).toHaveAttribute(
        'data-percentage',
        '99.9',
      )
    })

    it('includes zero as a string attribute (Vue behavior)', () => {
      const { container } = render(createStateTestComponent({ count: 0 }))
      expect(container.firstElementChild).toHaveAttribute('data-count', '0')
    })

    it('omits undefined values from attributes', () => {
      const { container } = render(
        createStateTestComponent({ defined: 'value', notDefined: undefined }),
      )
      expect(container.firstElementChild).toHaveAttribute(
        'data-defined',
        'value',
      )
      expect(container.firstElementChild).not.toHaveAttribute(
        'data-notdefined',
      )
    })

    it('handles empty state without producing data attributes', () => {
      const { container } = render(createStateTestComponent({}))
      const element = container.firstElementChild!
      const attrs = element.attributes
      for (let i = 0; i < attrs.length; i += 1) {
        if (attrs[i].name !== 'data-testid') {
          expect(attrs[i].name).not.toMatch(/^data-/)
        }
      }
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

    it('merges state-based data attributes with existing props', () => {
      const { container } = render(
        createStateTestComponent(
          { form: 'login' },
          { 'class': 'btn-primary', 'id': 'submit-btn', 'data-existing': 'prop' },
        ),
      )

      const element = container.firstElementChild
      expect(element).toHaveAttribute('data-form', 'login')
      expect(element).toHaveAttribute('class', 'btn-primary')
      expect(element).toHaveAttribute('id', 'submit-btn')
      expect(element).toHaveAttribute('data-existing', 'prop')
    })
  })

  describe('class resolution', () => {
    it('accepts class as a function', () => {
      const TestComponent = defineComponent({
        setup() {
          const { tag, mergedProps } = useRenderElement({
            componentProps: {
              class: (state: { active: boolean }) =>
                state.active ? 'active-class' : 'inactive-class',
            },
            state: computed(() => ({ active: true })),
            props: computed(() => ({ class: 'internal-class' })),
            defaultTagName: 'div',
          })
          return { tag, mergedProps }
        },
        template: `<component :is="tag" v-bind="mergedProps" />`,
      })

      const { container } = render(TestComponent)
      const element = container.firstElementChild
      expect(element?.className).toContain('active-class')
      expect(element?.className).toContain('internal-class')
    })

    it('accepts class as a function that returns undefined', () => {
      const TestComponent = defineComponent({
        setup() {
          const { tag, mergedProps } = useRenderElement({
            componentProps: {
              class: (state: { active: boolean }) =>
                state.active ? 'active-class' : undefined,
            },
            state: computed(() => ({ active: false })),
            props: computed(() => ({ class: 'internal-class' })),
            defaultTagName: 'div',
          })
          return { tag, mergedProps }
        },
        template: `<component :is="tag" v-bind="mergedProps" />`,
      })

      const { container } = render(TestComponent)
      expect(container.firstElementChild).toHaveAttribute(
        'class',
        'internal-class',
      )
    })
  })

  describe('style resolution', () => {
    it('accepts style as a function', () => {
      const TestComponent = defineComponent({
        setup() {
          const { tag, mergedProps } = useRenderElement({
            componentProps: {
              style: (state: { active: boolean }) => ({
                color: state.active ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 0)',
              }),
            },
            state: computed(() => ({ active: true })),
            props: computed(() => ({ style: { padding: '10px' } })),
            defaultTagName: 'div',
          })
          return { tag, mergedProps }
        },
        template: `<component :is="tag" v-bind="mergedProps" />`,
      })

      const { container } = render(TestComponent)
      const element = container.firstElementChild as HTMLElement
      expect(element.style.color).toBe('rgb(255, 0, 0)')
      expect(element.style.padding).toBe('10px')
    })

    it('accepts style as a function that returns undefined', () => {
      const TestComponent = defineComponent({
        setup() {
          const { tag, mergedProps } = useRenderElement({
            componentProps: {
              style: (state: { active: boolean }) =>
                state.active ? { color: 'rgb(255, 0, 0)' } : undefined,
            },
            state: computed(() => ({ active: false })),
            props: computed(() => ({ style: { padding: '10px' } })),
            defaultTagName: 'div',
          })
          return { tag, mergedProps }
        },
        template: `<component :is="tag" v-bind="mergedProps" />`,
      })

      const { container } = render(TestComponent)
      const element = container.firstElementChild as HTMLElement
      expect(element.style.padding).toBe('10px')
    })
  })

  describe('renderless mode', () => {
    it('does not render a root element when as=Slot', () => {
      const TestComponent = defineComponent({
        setup() {
          const { mergedProps, renderless, state } = useRenderElement({
            componentProps: { as: Slot },
            state: computed(() => ({ active: true })),
            props: computed(() => ({ 'data-testid': 'renderless-child' })),
          })
          return { mergedProps, renderless, state }
        },
        template: `
          <slot v-if="renderless" :props="mergedProps" :state="state" />
          <div v-else data-testid="should-not-exist" />
        `,
      })

      const Root = defineComponent({
        components: { TestComponent },
        template: `
          <TestComponent v-slot="{ props }">
            <span v-bind="props">child</span>
          </TestComponent>
        `,
      })

      render(Root)
      expect(screen.getByTestId('renderless-child').tagName).toBe('SPAN')
      expect(screen.queryByTestId('should-not-exist')).toBeNull()
    })

    it('forwards state through renderless slot correctly', () => {
      const TestComponent = defineComponent({
        setup() {
          const { mergedProps, renderless, state } = useRenderElement({
            componentProps: { as: Slot },
            state: computed(() => ({ active: true, count: 5 })),
            props: computed(() => ({ 'data-testid': 'renderless-state' })),
          })
          return { mergedProps, renderless, state }
        },
        template: `
          <slot v-if="renderless" :props="mergedProps" :state="state" />
        `,
      })

      const Root = defineComponent({
        components: { TestComponent },
        template: `
          <TestComponent v-slot="{ props, state }">
            <span v-bind="props">{{ state.active ? 'on' : 'off' }} - {{ state.count }}</span>
          </TestComponent>
        `,
      })

      render(Root)
      expect(screen.getByTestId('renderless-state')).toHaveTextContent(
        'on - 5',
      )
    })

    it('returns undefined ref when no ref is provided', () => {
      const TestComponent = defineComponent({
        setup() {
          const result = useRenderElement({
            componentProps: { as: Slot },
            state: computed(() => ({})),
          })
          expect(result.ref).toBeUndefined()
          return { renderless: result.renderless }
        },
        template: `<div v-if="!renderless">test</div>`,
      })

      render(TestComponent)
    })
  })

  describe('ref handling', () => {
    it('wraps a raw Ref through useMergedRefs and returns a callback ref', () => {
      const TestComponent = defineComponent({
        setup() {
          const targetRef = ref<HTMLElement | null>(null)
          const result = useRenderElement({
            componentProps: {},
            state: computed(() => ({})),
            defaultTagName: 'div',
            ref: targetRef,
          })

          // The returned ref should be a function (callback ref), not a raw Ref
          expect(typeof result.ref).toBe('function')
          return {
            tag: result.tag,
            mergedProps: result.mergedProps,
            renderRef: result.ref,
          }
        },
        template: `<component :is="tag" :ref="renderRef" v-bind="mergedProps" />`,
      })

      render(TestComponent)
    })

    it('sets the internal ref to the DOM element in normal mode', () => {
      let internalRef: { value: HTMLElement | null } | undefined

      const TestComponent = defineComponent({
        setup() {
          const targetRef = ref<HTMLElement | null>(null)
          internalRef = targetRef

          const {
            tag,
            mergedProps,
            ref: renderRef,
          } = useRenderElement({
            componentProps: {},
            state: computed(() => ({})),
            defaultTagName: 'button',
            ref: targetRef,
          })

          return { tag, mergedProps, renderRef }
        },
        template: `<component :is="tag" :ref="renderRef" v-bind="mergedProps" data-testid="ref-target" />`,
      })

      render(TestComponent)
      const button = screen.getByTestId('ref-target')
      expect(internalRef?.value).toBe(button)
    })
  })

  describe('custom stateAttributesMapping', () => {
    it('supports custom state-to-data-attribute mapping', () => {
      const TestComponent = defineComponent({
        setup() {
          const { tag, mergedProps } = useRenderElement({
            componentProps: {},
            state: computed(() => ({ isActive: true, itemCount: 5 })),
            stateAttributesMapping: {
              isActive: (value: boolean) =>
                value ? { 'data-is-active': '' } : null,
              itemCount: (value: number) => ({
                'data-item-count': value.toString(),
              }),
            },
            defaultTagName: 'button',
          })
          return { tag, mergedProps }
        },
        template: `<component :is="tag" v-bind="mergedProps" />`,
      })

      const { container } = render(TestComponent)
      expect(container.firstElementChild).toHaveAttribute('data-is-active', '')
      expect(container.firstElementChild).toHaveAttribute(
        'data-item-count',
        '5',
      )
    })
  })
})
