import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { ProgressIndicator, ProgressRoot, ProgressTrack } from '..'

function createProgressApp(template: string) {
  return defineComponent({
    components: {
      ProgressIndicator,
      ProgressRoot,
      ProgressTrack,
    },
    template,
  })
}

describe('<ProgressTrack />', () => {
  it('renders a div by default', () => {
    render(createProgressApp(`
      <ProgressRoot :value="30">
        <ProgressTrack data-testid="track" />
      </ProgressRoot>
    `))

    expect(screen.getByTestId('track').tagName).toBe('DIV')
  })

  it('throws when rendered without a ProgressRoot ancestor', () => {
    expect(() =>
      render(createProgressApp(`
        <ProgressTrack />
      `)),
    ).toThrow()
  })

  it('throws when ProgressIndicator is rendered without a ProgressRoot ancestor', () => {
    expect(() =>
      render(createProgressApp(`
        <ProgressIndicator />
      `)),
    ).toThrow()
  })

  it('inherits the status data-* attribute from the root state', () => {
    render(createProgressApp(`
      <ProgressRoot :value="100">
        <ProgressTrack data-testid="track" />
      </ProgressRoot>
    `))

    expect(screen.getByTestId('track')).toHaveAttribute('data-complete')
  })
})
