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

describe('<ProgressIndicator />', () => {
  it('sets inline-start and width styles when determinate', () => {
    render(createProgressApp(`
      <ProgressRoot :value="33">
        <ProgressTrack>
          <ProgressIndicator data-testid="indicator" />
        </ProgressTrack>
      </ProgressRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    expect(indicator.style.insetInlineStart).toBe('0')
    expect(indicator.style.width).toBe('33%')
  })

  it('sets zero width when value is 0', () => {
    render(createProgressApp(`
      <ProgressRoot :value="0">
        <ProgressTrack>
          <ProgressIndicator data-testid="indicator" />
        </ProgressTrack>
      </ProgressRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    expect(indicator.style.width).toBe('0%')
  })

  it('leaves styles untouched when indeterminate', () => {
    render(createProgressApp(`
      <ProgressRoot :value="null">
        <ProgressTrack>
          <ProgressIndicator data-testid="indicator" />
        </ProgressTrack>
      </ProgressRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    expect(indicator.style.width).toBe('')
    expect(indicator.style.insetInlineStart).toBe('')
  })

  it('respects custom min/max', () => {
    render(createProgressApp(`
      <ProgressRoot :value="15" :min="10" :max="20">
        <ProgressTrack>
          <ProgressIndicator data-testid="indicator" />
        </ProgressTrack>
      </ProgressRoot>
    `))

    const indicator = screen.getByTestId('indicator') as HTMLElement
    expect(indicator.style.width).toBe('50%')
  })

  describe('data-* status attributes', () => {
    it('inherits data-progressing from the root state', () => {
      render(createProgressApp(`
        <ProgressRoot :value="40">
          <ProgressTrack>
            <ProgressIndicator data-testid="indicator" />
          </ProgressTrack>
        </ProgressRoot>
      `))

      expect(screen.getByTestId('indicator')).toHaveAttribute('data-progressing')
    })

    it('inherits data-complete from the root state', () => {
      render(createProgressApp(`
        <ProgressRoot :value="100">
          <ProgressTrack>
            <ProgressIndicator data-testid="indicator" />
          </ProgressTrack>
        </ProgressRoot>
      `))

      expect(screen.getByTestId('indicator')).toHaveAttribute('data-complete')
    })

    it('inherits data-indeterminate from the root state', () => {
      render(createProgressApp(`
        <ProgressRoot :value="null">
          <ProgressTrack>
            <ProgressIndicator data-testid="indicator" />
          </ProgressTrack>
        </ProgressRoot>
      `))

      expect(screen.getByTestId('indicator')).toHaveAttribute('data-indeterminate')
    })
  })
})
