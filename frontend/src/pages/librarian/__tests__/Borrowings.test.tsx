import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Borrowings from '../Borrowings'

vi.mock('../../../api/client', () => {
  const get = vi.fn()
  const post = vi.fn()
  return { api: { get, post } }
})

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ state: { user: { id: 1, email: 'lib@example.com', role: 'librarian' } } }),
}))

import { api } from '../../../api/client'

function sampleItems() {
  return [
    { id: 1, book: { id: 1, title: 'B1', author: 'A1' }, user: { id: 2, email: 'm@e.com' }, borrowed_at: new Date('2024-01-02').toISOString(), due_date: new Date('2024-01-08').toISOString(), status: 'borrowed' },
    { id: 2, book: { id: 2, title: 'B2', author: 'A2' }, user: { id: 3, email: 'm2@e.com' }, borrowed_at: new Date('2024-01-01').toISOString(), due_date: new Date('2024-01-10').toISOString(), status: 'returned' },
  ]
}

function setup(items = sampleItems()) {
  ;(api.get as any).mockResolvedValue({ data: items })
  render(<Borrowings />)
}

describe('Librarian Borrowings page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(api.get as any).mockResolvedValue({ data: sampleItems() }) // default fallback
  })

  it('loads, filters, sorts, and clears filters', async () => {
    setup()
    await screen.findByText('B1')

    // status filter
    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'overdue' } })
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))

    // search
    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() })
    fireEvent.change(screen.getByPlaceholderText('Search member or book...'), { target: { value: 'B1' } })
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(3))

    // date filter
    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() })
    const dateInput = screen.getByDisplayValue('') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2024-01-05' } })
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(4))

    // clear filters
    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() })
    fireEvent.click(screen.getByText('Clear'))
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(5))

    // sort headers
    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() })
    // Click the sort header using role=columnheader and name
    const borrowedHeader = screen.getAllByRole('columnheader', { name: /Borrowed/i })[0]
    fireEvent.click(borrowedHeader)
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(6))

    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() })
    const dueHeader = screen.getAllByRole('columnheader', { name: /Due/i })[0]
    fireEvent.click(dueHeader)
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(7))
  })

  it('opens return modal, submits with optional comment and reloads list', async () => {
    setup()
    await screen.findByText('B1')

    fireEvent.click(screen.getAllByText('Return')[0])
    const comment = screen.getByLabelText('Optional comment') as HTMLInputElement
    fireEvent.change(comment, { target: { value: 'All good' } })

    ;(api.post as any).mockResolvedValueOnce({})
    ;(api.get as any).mockResolvedValueOnce({ data: sampleItems() }) // reload
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Return' }))

    await waitFor(() => expect(api.post).toHaveBeenCalledWith('/borrowings/1/return_book', { comment: 'All good' }))
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
  })
})


