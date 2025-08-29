import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../Login'
import React from 'react'

const mockLogin = vi.fn<[], any>().mockResolvedValue(true)
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => ({ state: { loading: false }, login: (email: string, password: string) => mockLogin(email, password) })
  }
})

describe('Login page', () => {
  it('submits credentials and redirects on success', async () => {
    render(<Login />)
    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'password123'))
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})


