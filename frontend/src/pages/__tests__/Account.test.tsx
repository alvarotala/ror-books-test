import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import Account from '../Account'

const getMock = vi.fn()
const putMock = vi.fn()
const patchMock = vi.fn()
const refreshMock = vi.fn()
const logoutMock = vi.fn()

vi.mock('../../api/client', () => {
  return {
    api: {
      get: (...args: any[]) => getMock(...args),
      put: (...args: any[]) => putMock(...args),
      patch: (...args: any[]) => patchMock(...args),
    },
    ensureCsrfToken: () => Promise.resolve(),
  }
})

vi.mock('../../context/AuthContext', () => {
  return {
    useAuth: () => ({ refresh: refreshMock, logout: logoutMock })
  }
})

describe('Account page', () => {
  beforeEach(() => {
    getMock.mockReset()
    putMock.mockReset()
    patchMock.mockReset()
    refreshMock.mockReset()
    logoutMock.mockReset()
  })

  it('loads profile and allows saving', async () => {
    getMock.mockResolvedValue({ data: { user: { first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' } } })
    putMock.mockResolvedValue({ data: {} })
    refreshMock.mockResolvedValue(undefined)

    render(<Account />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    expect(await screen.findByText(/account settings/i)).toBeInTheDocument()

    await userEvent.clear(screen.getByLabelText(/first name/i))
    await userEvent.type(screen.getByLabelText(/first name/i), 'Grace')
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(putMock).toHaveBeenCalled())
    expect(refreshMock).toHaveBeenCalled()
    expect(screen.getByText(/profile updated/i)).toBeInTheDocument()
  })

  it('changes password and shows message', async () => {
    getMock.mockResolvedValue({ data: { user: { first_name: '', last_name: '', email: '' } } })
    patchMock.mockResolvedValue({ data: {} })

    render(<Account />)
    await screen.findByText(/account settings/i)
    await userEvent.type(screen.getByLabelText(/current password/i), 'oldpass')
    await userEvent.type(screen.getByLabelText(/^new password$/i), 'newpass')
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'newpass')
    await userEvent.click(screen.getByRole('button', { name: /change password/i }))
    await waitFor(() => expect(patchMock).toHaveBeenCalled())
    expect(screen.getByText(/password changed/i)).toBeInTheDocument()
  })
})


