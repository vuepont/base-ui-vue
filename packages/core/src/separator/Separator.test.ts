import { render, screen } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { Slot } from '../utils/slot'
import { Separator } from './index'

describe('<Separator />', () => {
  it('renders a separator', () => {
    render(Separator)

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  describe('prop: orientation', () => {
    (['horizontal', 'vertical'] as const).forEach((orientation) => {
      it(orientation, () => {
        render(Separator, {
          props: {
            orientation,
          },
        })

        expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', orientation)
        expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', orientation)
      })
    })
  })

  it('supports rendering as another tag', () => {
    render(Separator, {
      props: {
        as: 'hr',
      },
    })

    expect(screen.getByRole('separator').tagName).toBe('HR')
  })

  it('supports renderless mode', () => {
    const TestComponent = defineComponent({
      components: { Separator },
      setup() {
        return { Slot }
      },
      template: `
        <Separator
          :as="Slot"
          orientation="vertical"
          v-slot="{ props, state, ref }"
        >
          <span
            v-bind="props"
            :ref="ref"
            data-testid="renderless-separator"
          >
            {{ state.orientation }}
          </span>
        </Separator>
      `,
    })

    const wrapper = mount(TestComponent)
    const separator = wrapper.get('[data-testid="renderless-separator"]')

    expect(separator.attributes('role')).toBe('separator')
    expect(separator.attributes('aria-orientation')).toBe('vertical')
    expect(separator.attributes('data-orientation')).toBe('vertical')
    expect(separator.text()).toBe('vertical')
  })
})
