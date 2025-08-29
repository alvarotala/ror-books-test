import { render, screen } from '@testing-library/react'
import React from 'react'
import RoleRoute from '../RoleRoute'

vi.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => ({ state: { user: { role: 'librarian' } } })
  }
})

describe('RoleRoute', () => {
  it('renders librarian node when user is librarian', () => {
    render(<RoleRoute librarian={<div>Librarian</div>} member={<div>Member</div>} />)
    expect(screen.getByText('Librarian')).toBeInTheDocument()
  })
})


