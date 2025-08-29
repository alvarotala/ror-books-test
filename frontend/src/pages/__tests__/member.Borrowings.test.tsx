import { render, screen, waitFor, within } from '@testing-library/react'
import React from 'react'
import MemberBorrowingsPage from '../member/Borrowings'

const getMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: any[]) => getMock(...args),
    },
  }
})

describe('Member Borrowings', () => {
  beforeEach(() => getMock.mockReset())

  it('loads and displays items', async () => {
    getMock.mockResolvedValueOnce({ data: [
      { id: 1, book: { id: 1, title: 'T1', author: 'A1' }, borrowed_at: new Date().toISOString(), due_date: new Date().toISOString(), status: 'borrowed' },
    ] })
    render(<MemberBorrowingsPage />)
    await waitFor(() => expect(screen.getByText('T1')).toBeInTheDocument())
    const row = screen.getByText('T1').closest('tr') as HTMLTableRowElement
    expect(row).toBeInTheDocument()
    expect(within(row).getByText(/borrowed/i)).toBeInTheDocument()
  })
})


