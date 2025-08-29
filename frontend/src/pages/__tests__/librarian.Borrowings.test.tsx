import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, screen, waitFor, within } from '../../test-utils'
import React from 'react'
import BorrowingsPage from '../librarian/Borrowings'

const getMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: unknown[]) => getMock(...args),
      post: vi.fn(),
    },
  }
})

vi.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => ({ state: { user: { role: 'librarian' } } })
  }
})

describe('Librarian Borrowings', () => {
  beforeEach(() => getMock.mockReset())

  it('loads and displays rows', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5); // 5 days in the future
    
    getMock.mockResolvedValueOnce({ data: [
      { id: 1, book: { id: 1, title: 'T1', author: 'A1' }, borrowed_at: new Date().toISOString(), due_date: futureDate.toISOString(), status: 'borrowed', user: { id: 1, email: 'm@e.com' } },
    ] })
    renderWithRouter(<BorrowingsPage />)
    await waitFor(() => expect(screen.getByText('T1')).toBeInTheDocument())
    const row = screen.getByText('T1').closest('tr') as HTMLTableRowElement
    expect(row).toBeInTheDocument()
    expect(within(row).getByText(/borrowed/i)).toBeInTheDocument()
  })
})


