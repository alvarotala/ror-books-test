import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import BorrowButton from '../BorrowButton'

const postMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: { post: (...args: any[]) => postMock(...args) },
  }
})

describe('BorrowButton', () => {
  beforeEach(() => {
    postMock.mockReset()
  })

  it('borrows successfully and then shows N/A', async () => {
    postMock.mockResolvedValue({ data: {} })
    render(<BorrowButton bookId={1} />)
    await userEvent.click(screen.getByRole('button', { name: /borrow/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm borrow/i }))
    await waitFor(() => expect(screen.getByText(/borrowed!/i)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('shows error when API fails', async () => {
    // Axios-style error shape
    postMock.mockRejectedValue({ isAxiosError: true, response: { data: { error: 'Out of stock' } } })
    render(<BorrowButton bookId={2} />)
    await userEvent.click(screen.getByRole('button', { name: /borrow/i }))
    await userEvent.click(screen.getByRole('button', { name: /confirm borrow/i }))
    await waitFor(() => expect(screen.getByText(/out of stock/i)).toBeInTheDocument())
  })
})


