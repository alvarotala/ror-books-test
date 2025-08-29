import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, screen, waitFor } from '../../test-utils'
import React from 'react'
import LibrarianDashboard from '../librarian/Dashboard'

const getMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: unknown[]) => getMock(...args),
    },
  }
})

vi.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => ({ state: { user: { role: 'librarian' } } })
  }
})

describe('Librarian Dashboard', () => {
  beforeEach(() => getMock.mockReset())

  it('loads dashboard data and renders stats', async () => {
    getMock.mockResolvedValueOnce({ data: {
      total_books: 10,
      currently_borrowed: 2,
      due_today: 1,
      members_with_overdue: 1,
      top_genres: { Fiction: 5 },
      recent_borrowings: [],
    } })
    renderWithRouter(<LibrarianDashboard />)
    await waitFor(() => expect(screen.getByText(/total books/i)).toBeInTheDocument())
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})


