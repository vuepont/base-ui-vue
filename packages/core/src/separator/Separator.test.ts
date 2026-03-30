import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { Separator } from './index'

describe('<Separator />', () => {
  it('renders a separator', () => {
    render(Separator)

    expect(screen.getByRole('separator')).toBeInTheDocument()
  })

  describe('prop: orientation', () => {
    ;(['horizontal', 'vertical'] as const).forEach((orientation) => {
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
})
