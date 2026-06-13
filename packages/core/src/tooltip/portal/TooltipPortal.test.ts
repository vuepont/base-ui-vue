import { render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref, shallowRef } from 'vue'
import TooltipPositioner from '../positioner/TooltipPositioner.vue'
import TooltipRoot from '../root/TooltipRoot.vue'
import TooltipPortal from './TooltipPortal.vue'

const CONTENT = 'Tooltip portal content'

interface TooltipPortalExpose {
  element: HTMLElement | null
}

function createPortalTarget(id = 'tooltip-portal-target') {
  const target = document.createElement('div')
  target.id = id
  target.dataset.testid = id
  document.body.appendChild(target)
  return target
}

afterEach(() => {
  document
    .querySelectorAll('[data-testid^="tooltip-portal-target"]')
    .forEach(element => element.remove())
})

describe('<TooltipPortal />', () => {
  describe('prop forwarding', () => {
    it('forwards custom props to the default element', () => {
      render(defineComponent({
        components: {
          TooltipPortal,
          TooltipRoot,
        },
        template: `
          <TooltipRoot default-open>
            <TooltipPortal data-testid="root" lang="fr" data-foobar="portal">
              ${CONTENT}
            </TooltipPortal>
          </TooltipRoot>
        `,
      }))

      const portal = screen.getByTestId('root')

      expect(portal.tagName).toBe('DIV')
      expect(portal).toHaveAttribute('lang', 'fr')
      expect(portal).toHaveAttribute('data-foobar', 'portal')
      expect(portal).toHaveAttribute('data-base-ui-vue-portal', '')
      expect(portal).toHaveTextContent(CONTENT)
    })

    it('forwards the custom `style` attribute defined on the component', () => {
      render(defineComponent({
        components: {
          TooltipPortal,
          TooltipRoot,
        },
        template: `
          <TooltipRoot default-open>
            <TooltipPortal data-testid="root" style="color: green;">
              ${CONTENT}
            </TooltipPortal>
          </TooltipRoot>
        `,
      }))

      expect(screen.getByTestId('root').getAttribute('style')).toContain('color: green')
    })

    it('forwards custom props to the customized element defined with `as`', () => {
      render(defineComponent({
        components: {
          TooltipPortal,
          TooltipRoot,
        },
        template: `
          <TooltipRoot default-open>
            <TooltipPortal as="section" data-testid="custom-root" data-foobar="portal">
              ${CONTENT}
            </TooltipPortal>
          </TooltipRoot>
        `,
      }))

      const portal = screen.getByTestId('custom-root')

      expect(portal.tagName).toBe('SECTION')
      expect(portal).toHaveAttribute('data-foobar', 'portal')
    })
  })

  describe('ref', () => {
    it('attaches the ref', async () => {
      const portalRef = shallowRef<TooltipPortalExpose | null>(null)

      render(defineComponent({
        components: {
          TooltipPortal,
          TooltipRoot,
        },
        setup() {
          return {
            portalRef,
          }
        },
        template: `
          <TooltipRoot default-open>
            <TooltipPortal ref="portalRef" data-testid="root">
              ${CONTENT}
            </TooltipPortal>
          </TooltipRoot>
        `,
      }))

      await nextTick()

      const element = portalRef.value?.element

      expect(element).toBeInstanceOf(window.HTMLDivElement)
      expect(element).toBe(screen.getByTestId('root'))
    })
  })

  describe('prop: className', () => {
    it('should apply the className when passed as a string', () => {
      render(defineComponent({
        components: {
          TooltipPortal,
          TooltipRoot,
        },
        template: `
          <TooltipRoot default-open>
            <TooltipPortal class="test-class">
              ${CONTENT}
            </TooltipPortal>
          </TooltipRoot>
        `,
      }))

      expect(document.querySelector('.test-class')).not.toBeNull()
    })
  })

  it('renders into the provided container', () => {
    const target = createPortalTarget()

    render(defineComponent({
      components: {
        TooltipPortal,
        TooltipRoot,
      },
      setup() {
        return {
          target,
        }
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPortal :container="target" data-testid="root">
            ${CONTENT}
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(target.querySelector('[data-testid="root"]')).toHaveTextContent(CONTENT)
  })

  it('uses container before the Vue Teleport target alias', () => {
    const containerTarget = createPortalTarget('tooltip-portal-target-container')
    const toTarget = createPortalTarget('tooltip-portal-target-to')

    render(defineComponent({
      components: {
        TooltipPortal,
        TooltipRoot,
      },
      setup() {
        return {
          containerTarget,
        }
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPortal
            :container="containerTarget"
            to="#tooltip-portal-target-to"
            data-testid="root"
          >
            ${CONTENT}
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(containerTarget.querySelector('[data-testid="root"]')).toHaveTextContent(CONTENT)
    expect(toTarget.querySelector('[data-testid="root"]')).toBeNull()
  })

  it('supports the Vue Teleport target alias', () => {
    const target = createPortalTarget()

    render(defineComponent({
      components: {
        TooltipPortal,
        TooltipRoot,
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPortal to="#tooltip-portal-target" data-testid="root">
            ${CONTENT}
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(target.querySelector('[data-testid="root"]')).toHaveTextContent(CONTENT)
  })

  it('renders inline when Teleport is disabled', () => {
    const { container } = render(defineComponent({
      components: {
        TooltipPortal,
        TooltipRoot,
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPortal disabled data-testid="root">
            ${CONTENT}
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(container.querySelector('[data-testid="root"]')).toBe(screen.getByTestId('root'))
  })

  it('does not render before the root is mounted', () => {
    render(defineComponent({
      components: {
        TooltipPortal,
        TooltipRoot,
      },
      template: `
        <TooltipRoot>
          <TooltipPortal data-testid="root">
            ${CONTENT}
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(screen.queryByTestId('root')).toBeNull()
  })

  it('keeps the portal mounted when keepMounted is true', () => {
    render(defineComponent({
      components: {
        TooltipPortal,
        TooltipPositioner,
        TooltipRoot,
      },
      template: `
        <TooltipRoot>
          <TooltipPortal keep-mounted disabled>
            <TooltipPositioner data-testid="positioner">
              ${CONTENT}
            </TooltipPositioner>
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(screen.getByTestId('positioner')).toHaveAttribute('inert')
    expect(screen.getByTestId('positioner')).toHaveTextContent(CONTENT)
  })

  it('throws when rendered without a TooltipPortal ancestor', () => {
    const TestComponent = defineComponent({
      components: {
        TooltipPositioner,
        TooltipRoot,
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPositioner />
        </TooltipRoot>
      `,
    })

    expect(() => render(TestComponent)).toThrow(
      'Base UI Vue: <TooltipPortal> is missing.',
    )
  })

  it('waits for a null container to resolve', async () => {
    const target = createPortalTarget()
    const containerTarget = ref<HTMLElement | null>(null)

    render(defineComponent({
      components: {
        TooltipPortal,
        TooltipRoot,
      },
      setup() {
        return {
          containerTarget,
        }
      },
      template: `
        <TooltipRoot default-open>
          <TooltipPortal :container="containerTarget" data-testid="root">
            ${CONTENT}
          </TooltipPortal>
        </TooltipRoot>
      `,
    }))

    expect(screen.queryByTestId('root')).toBeNull()

    containerTarget.value = target
    await nextTick()

    expect(target.querySelector('[data-testid="root"]')).toHaveTextContent(CONTENT)
  })
})
