import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import MemberDashboard from '../member/Dashboard'

const getMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: any[]) => getMock(...args),
    },
  }
})

describe('Member Dashboard', () => {
  beforeEach(() => getMock.mockReset())

  it('renders alerts and lists', async () => {
    getMock.mockResolvedValueOnce({ data: {
      current_borrowings: [],
      history: [],
      top_books: [],
      alerts: { overdue_count: 1, due_soon_count: 2 },
    } })
    render(<MemberDashboard />)
    await waitFor(() => expect(screen.getByText(/dashboard/i)).toBeInTheDocument())
    expect(screen.getByText('Overdue')).toBeInTheDocument()
    expect(screen.getByText('Due soon (3d)')).toBeInTheDocument()
  })
})


