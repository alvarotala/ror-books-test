import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import MembersPage from '../librarian/Members'

const getMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: any[]) => getMock(...args),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

vi.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => ({ state: { user: { role: 'librarian' } } })
  }
})

describe('Librarian Members', () => {
  beforeEach(() => getMock.mockReset())

  it('loads and shows member rows', async () => {
    getMock.mockResolvedValueOnce({ data: [
      { id: 1, email: 'm@e.com', first_name: 'F', last_name: 'L' },
    ] })
    render(<MembersPage />)
    await waitFor(() => expect(screen.getByText('m@e.com')).toBeInTheDocument())
    expect(screen.getByText('F')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })
})


