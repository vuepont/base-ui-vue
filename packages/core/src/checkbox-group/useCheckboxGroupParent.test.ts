import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import CheckboxRoot from '../checkbox/root/CheckboxRoot.vue'
import CheckboxGroup from './CheckboxGroup.vue'

const allValues = ['a', 'b', 'c']

function createApp(template: string, setupExtras?: () => Record<string, unknown>) {
  return defineComponent({
    components: {
      CheckboxGroup,
      CheckboxRoot,
    },
    setup() {
      const value = ref<string[]>([])
      return { allValues, value, ...setupExtras?.() }
    },
    template,
  })
}

describe('useCheckboxGroupParent', () => {
  it('should control child checkboxes', async () => {
    const user = userEvent.setup()
    const parentCheckedChange = vi.fn()
    const childCheckedChange = vi.fn()

    render(createApp(`
      <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
        <CheckboxRoot parent data-testid="parent" @checked-change="parentCheckedChange" />
        <CheckboxRoot value="a" />
        <CheckboxRoot value="b" @checked-change="childCheckedChange" />
        <CheckboxRoot value="c" />
      </CheckboxGroup>
    `, () => ({ parentCheckedChange, childCheckedChange })))

    const children = screen.getAllByRole('checkbox').filter(
      checkbox => checkbox.getAttribute('value') && checkbox.tagName === 'BUTTON',
    )
    const parent = screen.getByTestId('parent')

    children.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })

    await user.click(parent)
    expect(parent).toHaveAttribute('aria-checked', 'true')
    children.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('aria-checked', 'true')
    })
    expect(parentCheckedChange).toHaveBeenCalledTimes(1)
    expect(childCheckedChange).toHaveBeenCalledTimes(0)

    await user.click(parent)
    expect(parent).toHaveAttribute('aria-checked', 'false')
    children.forEach((checkbox) => {
      expect(checkbox).toHaveAttribute('aria-checked', 'false')
    })
    expect(parentCheckedChange).toHaveBeenCalledTimes(2)
    expect(childCheckedChange).toHaveBeenCalledTimes(0)
  })

  it('parent should be marked as mixed if some children are checked', async () => {
    const user = userEvent.setup()

    render(createApp(`
      <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
        <CheckboxRoot parent data-testid="parent" />
        <CheckboxRoot value="a" data-testid="child-a" />
        <CheckboxRoot value="b" />
        <CheckboxRoot value="c" />
      </CheckboxGroup>
    `))

    await user.click(screen.getByTestId('child-a'))
    expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('should correctly initialize the values array', () => {
    render(defineComponent({
      components: { CheckboxGroup, CheckboxRoot },
      setup() {
        const value = ref<string[]>(['a'])
        return { allValues, value }
      },
      template: `
        <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
          <CheckboxRoot parent data-testid="parent" />
          <CheckboxRoot value="a" data-testid="checkboxA" />
          <CheckboxRoot value="b" />
          <CheckboxRoot value="c" />
        </CheckboxGroup>
      `,
    }))

    expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'mixed')
    expect(screen.getByTestId('checkboxA')).toHaveAttribute('aria-checked', 'true')
  })

  it('should update the values array when a child checkbox is clicked', async () => {
    const user = userEvent.setup()

    render(defineComponent({
      components: { CheckboxGroup, CheckboxRoot },
      setup() {
        const value = ref<string[]>(['a'])
        return { allValues, value }
      },
      template: `
        <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
          <CheckboxRoot parent data-testid="parent" />
          <CheckboxRoot value="a" data-testid="checkboxA" />
          <CheckboxRoot value="b" data-testid="checkboxB" />
          <CheckboxRoot value="c" data-testid="checkboxC" />
        </CheckboxGroup>
      `,
    }))

    expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'mixed')

    await user.click(screen.getByTestId('checkboxB'))
    await user.click(screen.getByTestId('checkboxC'))

    expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'true')
  })

  it('should apply space-separated aria-controls attribute with registered child ids', async () => {
    render(defineComponent({
      components: { CheckboxGroup, CheckboxRoot },
      setup() {
        const value = ref<string[]>([])
        const allValuesWithWhitespace = ['alpha one', 'beta two', 'gamma three']
        return { value, allValuesWithWhitespace }
      },
      template: `
      <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValuesWithWhitespace">
        <CheckboxRoot parent data-testid="parent" />
        <CheckboxRoot id="control-alpha" value="alpha one" />
        <CheckboxRoot id="control-beta" value="beta two" />
        <CheckboxRoot id="control-gamma" value="gamma three" />
      </CheckboxGroup>
    `,
    }))

    const parent = screen.getByTestId('parent')

    await waitFor(() => {
      expect(parent).toHaveAttribute(
        'aria-controls',
        ['control-alpha', 'control-beta', 'control-gamma'].join(' '),
      )
    })
  })

  it('preserves initial state if mixed when parent is clicked', async () => {
    const user = userEvent.setup()

    render(createApp(`
      <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
        <CheckboxRoot parent data-testid="parent" />
        <CheckboxRoot value="a" data-testid="checkboxA" />
        <CheckboxRoot value="b" data-testid="checkboxB" />
        <CheckboxRoot value="c" data-testid="checkboxC" />
      </CheckboxGroup>
    `))

    const parent = screen.getByTestId('parent')
    const checkboxA = screen.getByTestId('checkboxA')
    const checkboxB = screen.getByTestId('checkboxB')
    const checkboxC = screen.getByTestId('checkboxC')

    await user.click(checkboxA)
    expect(parent).toHaveAttribute('aria-checked', 'mixed')

    await user.click(parent)
    expect(checkboxA).toHaveAttribute('aria-checked', 'true')
    expect(checkboxB).toHaveAttribute('aria-checked', 'true')
    expect(checkboxC).toHaveAttribute('aria-checked', 'true')

    await user.click(parent)
    expect(checkboxA).toHaveAttribute('aria-checked', 'false')
    expect(checkboxB).toHaveAttribute('aria-checked', 'false')
    expect(checkboxC).toHaveAttribute('aria-checked', 'false')

    await user.click(parent)
    expect(parent).toHaveAttribute('aria-checked', 'mixed')
    expect(checkboxA).toHaveAttribute('aria-checked', 'true')
    expect(checkboxB).toHaveAttribute('aria-checked', 'false')
    expect(checkboxC).toHaveAttribute('aria-checked', 'false')
  })

  it('handles unchecked disabled child checkboxes', async () => {
    const user = userEvent.setup()

    render(createApp(`
      <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
        <CheckboxRoot parent data-testid="parent" />
        <CheckboxRoot value="a" disabled data-testid="checkboxA" />
        <CheckboxRoot value="b" />
        <CheckboxRoot value="c" />
      </CheckboxGroup>
    `))

    await user.click(screen.getByTestId('parent'))

    expect(screen.getByTestId('parent')).toHaveAttribute('aria-checked', 'mixed')
    expect(screen.getByTestId('checkboxA')).toHaveAttribute('aria-checked', 'false')
  })

  it('handles checked disabled child checkboxes', async () => {
    const user = userEvent.setup()

    render(defineComponent({
      components: { CheckboxGroup, CheckboxRoot },
      setup() {
        const value = ref<string[]>(['a'])
        return { allValues, value }
      },
      template: `
        <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
          <CheckboxRoot parent data-testid="parent" />
          <CheckboxRoot value="a" disabled data-testid="checkboxA" />
          <CheckboxRoot value="b" data-testid="checkboxB" />
          <CheckboxRoot value="c" />
        </CheckboxGroup>
      `,
    }))

    const parent = screen.getByTestId('parent')
    const checkboxA = screen.getByTestId('checkboxA')
    const checkboxB = screen.getByTestId('checkboxB')

    await user.click(parent)
    expect(checkboxA).toHaveAttribute('aria-checked', 'true')
    expect(checkboxB).toHaveAttribute('aria-checked', 'true')

    await user.click(parent)
    expect(checkboxA).toHaveAttribute('aria-checked', 'true')
    expect(checkboxB).toHaveAttribute('aria-checked', 'false')
  })

  it('restores the latest mixed snapshot after an external controlled update', async () => {
    const user = userEvent.setup()

    render(defineComponent({
      components: { CheckboxGroup, CheckboxRoot },
      setup() {
        const value = ref<string[]>(['a'])

        function applyExternalMixedState() {
          value.value = ['b']
        }

        return { allValues, value, applyExternalMixedState }
      },
      template: `
        <div>
          <CheckboxGroup :value="value" @value-change="(nextValue) => value = nextValue" :all-values="allValues">
            <CheckboxRoot parent data-testid="parent" />
            <CheckboxRoot value="a" data-testid="checkboxA" />
            <CheckboxRoot value="b" data-testid="checkboxB" />
            <CheckboxRoot value="c" data-testid="checkboxC" />
          </CheckboxGroup>
          <button type="button" @click="applyExternalMixedState">external</button>
        </div>
      `,
    }))

    const parent = screen.getByTestId('parent')
    const checkboxA = screen.getByTestId('checkboxA')
    const checkboxB = screen.getByTestId('checkboxB')
    const checkboxC = screen.getByTestId('checkboxC')

    expect(parent).toHaveAttribute('aria-checked', 'mixed')
    expect(checkboxA).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('button', { name: 'external' }))

    expect(parent).toHaveAttribute('aria-checked', 'mixed')
    expect(checkboxA).toHaveAttribute('aria-checked', 'false')
    expect(checkboxB).toHaveAttribute('aria-checked', 'true')

    await user.click(parent)
    expect(checkboxA).toHaveAttribute('aria-checked', 'true')
    expect(checkboxB).toHaveAttribute('aria-checked', 'true')
    expect(checkboxC).toHaveAttribute('aria-checked', 'true')

    await user.click(parent)
    expect(checkboxA).toHaveAttribute('aria-checked', 'false')
    expect(checkboxB).toHaveAttribute('aria-checked', 'false')
    expect(checkboxC).toHaveAttribute('aria-checked', 'false')

    await user.click(parent)
    expect(parent).toHaveAttribute('aria-checked', 'mixed')
    expect(checkboxA).toHaveAttribute('aria-checked', 'false')
    expect(checkboxB).toHaveAttribute('aria-checked', 'true')
    expect(checkboxC).toHaveAttribute('aria-checked', 'false')
  })
})
