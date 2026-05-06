import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { ProgressLabel, ProgressRoot } from '..'

function createProgressApp(template: string) {
  return defineComponent({
    components: {
      ProgressLabel,
      ProgressRoot,
    },
    template,
  })
}

describe('<ProgressLabel />', () => {
  it('links aria-labelledby from the progress root to the label', async () => {
    render(createProgressApp(`
      <ProgressRoot :value="30">
        <ProgressLabel>Downloading</ProgressLabel>
      </ProgressRoot>
    `))

    await nextTick()

    const progress = screen.getByRole('progressbar')
    const label = screen.getByText('Downloading')

    expect(label.id).not.toBe('')
    expect(progress.getAttribute('aria-labelledby')).toBe(label.id)
  })

  it('respects an explicit id override', async () => {
    render(createProgressApp(`
      <ProgressRoot :value="30">
        <ProgressLabel id="custom-progress-label">Downloading</ProgressLabel>
      </ProgressRoot>
    `))

    await nextTick()

    const progress = screen.getByRole('progressbar')
    const label = screen.getByText('Downloading')

    expect(label.id).toBe('custom-progress-label')
    expect(progress.getAttribute('aria-labelledby')).toBe('custom-progress-label')
  })

  it('renders a span by default', () => {
    render(createProgressApp(`
      <ProgressRoot :value="30">
        <ProgressLabel>Downloading</ProgressLabel>
      </ProgressRoot>
    `))

    expect(screen.getByText('Downloading').tagName).toBe('SPAN')
  })

  it('inherits the status data-* attribute from the root state', () => {
    render(createProgressApp(`
      <ProgressRoot :value="null">
        <ProgressLabel data-testid="label">Loading</ProgressLabel>
      </ProgressRoot>
    `))

    expect(screen.getByTestId('label')).toHaveAttribute('data-indeterminate')
  })
})
