import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { checkboxGroupContextKey, useCheckboxGroupContext } from './CheckboxGroupContext'

describe('useCheckboxGroupContext', () => {
  it('throws by default when the provider is missing', () => {
    const TestComponent = defineComponent({
      setup() {
        useCheckboxGroupContext()
        return {}
      },
      template: '<div />',
    })

    expect(() => render(TestComponent)).toThrow(
      'Base UI Vue: CheckboxGroupContext is missing. CheckboxGroup parts must be placed within <CheckboxGroup>.',
    )
  })

  it('returns undefined when optional is true and the provider is missing', () => {
    const TestComponent = defineComponent({
      setup() {
        const context = useCheckboxGroupContext(true)
        return { context }
      },
      template: '<div>{{ context === undefined }}</div>',
    })

    const { getByText } = render(TestComponent)
    expect(getByText('true')).toBeTruthy()
  })

  it('returns the provided context', () => {
    const TestComponent = defineComponent({
      setup() {
        const context = useCheckboxGroupContext()
        return { context }
      },
      template: '<div>{{ context.disabled.value }}</div>',
    })

    const Provider = defineComponent({
      components: { TestComponent },
      setup() {
        const providedContext = {
          value: { value: [] },
          defaultValue: { value: [] },
          allValues: { value: undefined },
          disabled: { value: false },
          validation: {
            inputRef: { value: null },
            errors: { value: [] },
            state: { value: null },
            errorId: { value: undefined },
            getValidationProps: () => ({}),
            getInputValidationProps: () => ({}),
            commit: () => Promise.resolve(),
            reset: () => {},
          },
          parent: {
            id: 'parent-id',
            getParentProps: () => ({}),
            getChildProps: () => ({}),
          },
          setValue: () => {},
          registerControlRef: () => {},
        }

        return { providedContext }
      },
      provide() {
        return {
          [checkboxGroupContextKey as symbol]: this.providedContext,
        }
      },
      template: '<TestComponent />',
    })

    const { getByText } = render(Provider)
    expect(getByText('false')).toBeTruthy()
  })
})
