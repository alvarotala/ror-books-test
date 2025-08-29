import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, screen, waitFor } from '../../test-utils'
import React from 'react'
import MemberDashboard from '../member/Dashboard'

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
    useAuth: () => ({ state: { user: { role: 'member' } } })
  }
})

describe('Member Dashboard', () => {
  beforeEach(() => getMock.mockReset())

  it('renders alerts and lists', async () => {
    getMock.mockResolvedValueOnce({ data: {
      current_borrowings: [],
      history: [],
      top_books: [],
      alerts: { overdue_count: 0, due_soon_count: 0 },
    } })
    renderWithRouter(<MemberDashboard />)
    await waitFor(() => expect(screen.getByText(/dashboard/i)).toBeInTheDocument())
  })
})


