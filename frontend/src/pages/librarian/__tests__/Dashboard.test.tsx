import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, screen, fireEvent, waitFor } from '../../../test-utils'
import Dashboard from '../Dashboard'

vi.mock('../../../api/client', () => {
  const get = vi.fn()
  return { api: { get } }
})

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ state: { user: { id: 1, email: 'lib@example.com', role: 'librarian' } } }),
}))

import { api } from '../../../api/client'

describe('Librarian Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads librarian data and renders stats and lists', async () => {
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: {
        total_books: 10,
        currently_borrowed: 2,
        due_today: 1,
        members_with_overdue: 3,
        top_genres: { Fiction: 5, SciFi: 2 },
        recent_borrowings: [
          { id: 1, created_at: new Date('2024-01-01').toISOString(), user: { id: 1, email: 'a@b.com' }, book: { id: 1, title: 'B1' } },
        ],
      },
    })

    renderWithRouter(<Dashboard />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Fiction')).toBeInTheDocument()
    expect(screen.getByText('Recent borrowings')).toBeInTheDocument()
  })

  it('performs debounced quick search', async () => {
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { total_books: 0, currently_borrowed: 0, due_today: 0, members_with_overdue: 0, top_genres: {}, recent_borrowings: [] } })
    renderWithRouter(<Dashboard />)
    await waitFor(() => expect(api.get).toHaveBeenCalled())

    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: [{ id: 1, title: 'The Book', author: 'Someone' }] })
    fireEvent.change(screen.getByPlaceholderText('Search books by title, author, or genre'), { target: { value: 'the' } })

    // Debounce resolves naturally
    await screen.findByText('The Book')
  })
})


