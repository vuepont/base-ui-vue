import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h } from 'vue'
import { reset as resetErrors } from './error'
import { useControllableState } from './useControllableState'

const TestComponent = defineComponent({
  props: {
    value: {
      type: null,
      required: false,
    },
    defaultValue: {
      type: null,
      required: false,
    },
  },
  setup(props) {
    const { value, setValue } = useControllableState<number | string | number[] | undefined>({
      controlled: () => props.value,
      default: () => props.defaultValue,
      name: 'TestComponent',
    })

    const displayValue = computed(() => {
      if (Array.isArray(value.value)) {
        return JSON.stringify(value.value)
      }

      return String(value.value)
    })

    function setToTwo() {
      setValue(2)
    }

    function increment() {
      setValue(prev => typeof prev === 'number' ? prev + 1 : prev)
    }

    return {
      displayValue,
      increment,
      setToTwo,
      value,
    }
  },
  render() {
    return h('div', [
      h('span', { 'data-testid': 'value' }, this.displayValue),
      h('button', { type: 'button', onClick: this.setToTwo }, 'set'),
      h('button', { type: 'button', onClick: this.increment }, 'increment'),
    ])
  },
})

describe('useControllableState', () => {
  beforeEach(() => {
    resetErrors()
    vi.restoreAllMocks()
  })

  it('works correctly when is not controlled', async () => {
    const user = userEvent.setup()

    render(TestComponent, {
      props: {
        defaultValue: 1,
      },
    })

    expect(screen.getByTestId('value')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'set' }))

    expect(screen.getByTestId('value')).toHaveTextContent('2')

    await user.click(screen.getByRole('button', { name: 'increment' }))

    expect(screen.getByTestId('value')).toHaveTextContent('3')
  })

  it('works correctly when is controlled', async () => {
    const user = userEvent.setup()

    render(TestComponent, {
      props: {
        value: 1,
      },
    })

    expect(screen.getByTestId('value')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'set' }))
    await user.click(screen.getByRole('button', { name: 'increment' }))

    expect(screen.getByTestId('value')).toHaveTextContent('1')
  })

  it('warns when switching from uncontrolled to controlled', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(TestComponent)

    expect(consoleError).not.toHaveBeenCalled()

    await wrapper.setProps({ value: 'foobar' })

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      'Base UI Vue: A component is changing the uncontrolled value state of TestComponent to be controlled. Elements should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled TestComponent element for the lifetime of the component. The nature of the state is determined during the first render. It\'s considered controlled if the value is not `undefined`.',
    )
  })

  it('should warn when switching from controlled to uncontrolled', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(TestComponent, {
      props: {
        value: 'foobar',
      },
    })

    expect(consoleError).not.toHaveBeenCalled()

    await wrapper.setProps({ value: undefined })

    expect(consoleError).toHaveBeenCalledExactlyOnceWith(
      'Base UI Vue: A component is changing the controlled value state of TestComponent to be uncontrolled. Elements should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled TestComponent element for the lifetime of the component. The nature of the state is determined during the first render. It\'s considered controlled if the value is not `undefined`.',
    )
  })

  describe('prop: defaultValue', () => {
    it('warns when changed after initial rendering', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = mount(TestComponent)

      expect(consoleError).not.toHaveBeenCalled()

      await wrapper.setProps({ defaultValue: 1 })

      expect(consoleError).toHaveBeenCalledExactlyOnceWith(
        'Base UI Vue: A component is changing the default value state of an uncontrolled TestComponent after being initialized. To suppress this warning opt to use a controlled TestComponent.',
      )
    })

    it('does not warn when controlled', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = mount(TestComponent, {
        props: {
          value: 1,
          defaultValue: 0,
        },
      })

      expect(consoleError).not.toHaveBeenCalled()

      await wrapper.setProps({ defaultValue: 1 })

      expect(consoleError).not.toHaveBeenCalled()
    })

    it('does not warn when NaN', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      mount(TestComponent, {
        props: {
          defaultValue: Number.NaN,
        },
      })

      expect(consoleError).not.toHaveBeenCalled()
    })

    it('does not warn when an array', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const wrapper = mount(TestComponent, {
        props: {
          defaultValue: [],
        },
      })

      await wrapper.setProps({
        defaultValue: [],
      })

      expect(consoleError).not.toHaveBeenCalled()
    })
  })
})
