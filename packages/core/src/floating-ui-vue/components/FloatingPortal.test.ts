import type { Component } from 'vue'
import type { UseFloatingPortalNodeProps } from './FloatingPortal'
import { cleanup, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import {
  defineComponent,
  h,
  nextTick,
  onMounted,
  shallowRef,
} from 'vue'
import FloatingPortalLite from '../../utils/FloatingPortalLite.vue'
import { Slot } from '../../utils/slot'
import FloatingPortal from './FloatingPortal.vue'

function createContainer(id = 'custom-root') {
  const container = document.createElement('div')
  container.id = id
  document.body.appendChild(container)
  return container
}

function renderApp(container?: UseFloatingPortalNodeProps['container']) {
  const App = defineComponent({
    setup() {
      const open = shallowRef(false)

      return () => [
        h('button', {
          'data-testid': 'reference',
          'onClick': () => {
            open.value = !open.value
          },
        }),
        h(
          FloatingPortal,
          { container },
          {
            default: () =>
              open.value
                ? h('div', { 'data-testid': 'floating' })
                : null,
          },
        ),
      ]
    },
  })

  return render(App)
}

afterEach(() => {
  cleanup()
  document
    .querySelectorAll('[data-floating-portal-test-root]')
    .forEach(element => element.remove())
})

describe('floatingPortal', () => {
  it('allows custom containers', async () => {
    const customRoot = createContainer()
    customRoot.setAttribute('data-floating-portal-test-root', '')

    renderApp(customRoot)

    await screen.getByTestId('reference').click()
    await nextTick()

    const parent = screen.getByTestId('floating').parentElement

    expect(parent?.hasAttribute('data-base-ui-vue-portal')).toBe(true)
    expect(parent?.parentElement).toBe(customRoot)
  })

  it('allows refs as containers', async () => {
    const el = createContainer()
    el.setAttribute('data-floating-portal-test-root', '')
    const container = shallowRef(el)

    renderApp(container)

    await screen.getByTestId('reference').click()
    await nextTick()

    const parent = screen.getByTestId('floating').parentElement

    expect(parent?.hasAttribute('data-base-ui-vue-portal')).toBe(true)
    expect(parent?.parentElement).toBe(el)
  })

  it('allows containers to be initially null', async () => {
    const RootApp = defineComponent({
      setup() {
        const open = shallowRef(false)
        const container = shallowRef<HTMLElement | null>(null)
        const renderContainer = shallowRef(false)

        onMounted(() => {
          renderContainer.value = true
        })

        return () => [
          renderContainer.value
            ? h('div', {
                'data-testid': 'root',
                'ref': (value) => {
                  container.value = value as HTMLElement | null
                },
              })
            : null,
          h('button', {
            'data-testid': 'reference',
            'onClick': () => {
              open.value = !open.value
            },
          }),
          h(
            FloatingPortal,
            { container },
            {
              default: () =>
                open.value
                  ? h('div', { 'data-testid': 'floating' })
                  : null,
            },
          ),
        ]
      },
    })

    render(RootApp)

    await screen.getByTestId('reference').click()
    await nextTick()
    await nextTick()

    const subRoot = screen.getByTestId('floating').parentElement
    const root = screen.getByTestId('root')

    expect(root).toBe(subRoot?.parentElement)
  })

  it('reattaches the portal when the container changes', async () => {
    const customRoot = createContainer()
    customRoot.setAttribute('data-floating-portal-test-root', '')

    const RootSwitcher = defineComponent({
      setup() {
        const open = shallowRef(false)
        const container = shallowRef<UseFloatingPortalNodeProps['container']>(undefined)

        return () => [
          h(
            FloatingPortal,
            { container: container.value },
            {
              default: () =>
                open.value
                  ? h('div', { 'data-testid': 'floating' })
                  : null,
            },
          ),
          h('button', {
            'data-testid': 'reference',
            'onClick': () => {
              open.value = !open.value
            },
          }),
          h('button', {
            'data-testid': 'use-undefined',
            'onClick': () => {
              container.value = undefined
            },
          }),
          h('button', {
            'data-testid': 'use-element',
            'onClick': () => {
              container.value = customRoot
            },
          }),
        ]
      },
    })

    render(RootSwitcher)

    await screen.getByTestId('reference').click()
    await nextTick()

    expect(screen.getByTestId('floating').parentElement?.parentElement).toBe(document.body)

    await screen.getByTestId('use-element').click()
    await nextTick()

    expect(screen.getByTestId('floating').parentElement?.parentElement).toBe(customRoot)

    await screen.getByTestId('use-undefined').click()
    await nextTick()

    const floatingInBodyAgain = screen.getByTestId('floating')

    expect(floatingInBodyAgain.parentElement?.parentElement).toBe(document.body)
    expect(customRoot.contains(floatingInBodyAgain)).toBe(false)
  })

  it('forwards HTML props to the portal element', async () => {
    render(defineComponent({
      components: {
        FloatingPortal,
      },
      template: `
        <FloatingPortal data-testid="portal-element" class="closed">
          <div />
        </FloatingPortal>
      `,
    }))

    await nextTick()

    const portal = document.querySelector('[data-testid="portal-element"]')

    expect(portal).not.toBeNull()
    expect(portal).toHaveClass('closed')
    expect(portal).toHaveAttribute('data-base-ui-vue-portal')
  })

  // eslint-disable-next-line test/prefer-lowercase-title
  it('FloatingPortalLite forwards HTML props to the portal element', async () => {
    render(defineComponent({
      components: {
        FloatingPortalLite,
      },
      template: `
        <FloatingPortalLite data-testid="lite-portal">
          <div />
        </FloatingPortalLite>
      `,
    }))

    await nextTick()

    const portal = document.querySelector('[data-testid="lite-portal"]')

    expect(portal).not.toBeNull()
  })

  it('nests portals inside the parent portal by default', async () => {
    render(defineComponent({
      components: {
        FloatingPortal,
      },
      template: `
        <FloatingPortal data-testid="outer-portal">
          <FloatingPortal data-testid="inner-portal">
            <div data-testid="nested-content" />
          </FloatingPortal>
        </FloatingPortal>
      `,
    }))

    await nextTick()
    await nextTick()

    const outerPortal = screen.getByTestId('outer-portal')
    const innerPortal = screen.getByTestId('inner-portal')

    expect(outerPortal).toContainElement(innerPortal)
    expect(innerPortal).toContainElement(screen.getByTestId('nested-content'))
  })

  it('supports renderless mode and forwards the internal ref callback', async () => {
    const CustomChild = defineComponent({
      props: {
        refCallback: Function,
        forwardedProps: Object,
      },
      setup(childProps) {
        return () =>
          h(
            'span',
            {
              ...(childProps.forwardedProps as Record<string, unknown>),
              'ref': childProps.refCallback,
              'data-testid': 'renderless-portal',
            },
            'renderless',
          )
      },
    }) as Component

    render(defineComponent({
      components: {
        CustomChild,
        FloatingPortal,
      },
      setup() {
        return {
          CustomChild,
          Slot,
        }
      },
      template: `
        <FloatingPortal :as="Slot">
          <template #default="{ ref, props }">
            <CustomChild :ref-callback="ref" :forwarded-props="props" />
          </template>
        </FloatingPortal>
      `,
    }))

    await nextTick()

    const portal = screen.getByTestId('renderless-portal')

    expect(portal).toHaveAttribute('data-base-ui-vue-portal')
  })
})
