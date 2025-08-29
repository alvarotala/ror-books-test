import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import MemberBooks from '../member/Books'

const getMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: any[]) => getMock(...args),
    },
  }
})

describe('Member Books', () => {
  beforeEach(() => getMock.mockReset())

  it('loads and renders table rows', async () => {
    getMock.mockResolvedValueOnce({ data: [
      { id: 1, title: 'T1', author: 'A1', genre: 'G', isbn: 'X', total_copies: 1, can_borrow: true },
    ] })
    render(<MemberBooks />)
    await waitFor(() => expect(screen.getByText('T1')).toBeInTheDocument())
    expect(screen.getByText('A1')).toBeInTheDocument()
  })
})


