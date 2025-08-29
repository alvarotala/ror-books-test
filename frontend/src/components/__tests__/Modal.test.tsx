import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../Modal'

describe('Modal', () => {
  it('does not render when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="Title">
        Content
      </Modal>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders content and closes on backdrop click', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Hello" footer={<button>Ok</button>}>
        World
      </Modal>
    )
    expect(screen.getByText('Hello')).toBeInTheDocument()
    expect(screen.getByText('World')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Ok' }))
    expect(onClose).not.toHaveBeenCalled()
    const backdrop = screen.getByTestId('backdrop')
    await userEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})


