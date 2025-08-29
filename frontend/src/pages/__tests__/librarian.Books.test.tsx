import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import Books from '../librarian/Books'

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

describe('Librarian Books', () => {
  beforeEach(() => getMock.mockReset())

  it('loads and shows book rows', async () => {
    getMock.mockResolvedValueOnce({ data: [
      { id: 1, title: 'T1', author: 'A1', genre: 'G', isbn: 'X', total_copies: 3 },
    ] })
    render(<Books />)
    await waitFor(() => expect(screen.getByText('T1')).toBeInTheDocument())
    expect(screen.getByText('A1')).toBeInTheDocument()
  })
})


