import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'

// Mock the api client used inside AuthContext
vi.mock('../../api/client', () => {
  const get = vi.fn()
  const post = vi.fn()
  const del = vi.fn()
  return {
    api: {
      get,
      post,
      delete: del,
      defaults: { headers: { common: {} as Record<string, string> } },
    },
    ensureCsrfToken: vi.fn().mockResolvedValue(undefined),
  }
})

// Re-import the mocked module's members for convenient access to spies
import { api, ensureCsrfToken } from '../../api/client'

function Consumer() {
  const { state, login, logout, refresh } = useAuth()
  return (
    <div>
      <div data-testid="loading">{String(state.loading)}</div>
      <div data-testid="user">{state.user ? state.user.email : 'none'}</div>
      <button onClick={() => login('user@example.com', 'secret')}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => refresh()}>refresh</button>
    </div>
  )
}

function renderWithProvider() {
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // default: initial session fetch returns null user
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: { user: null } })
  })

  it('performs initial load and sets user when session exists', async () => {
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { user: { id: 1, email: 'lib@example.com', role: 'librarian' } } })

    renderWithProvider()

    expect(screen.getByTestId('loading').textContent).toBe('true')
    await screen.findByText('lib@example.com')
    expect(screen.getByTestId('loading').textContent).toBe('false')
    expect(ensureCsrfToken).toHaveBeenCalled()
  })

  it('handles initial load error by setting user to null', async () => {
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('boom'))

    renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('user').textContent).toBe('none')
    })
  })

  it('login success updates user and returns true', async () => {
    renderWithProvider()

    ;(api.post as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { user: { id: 1, email: 'user@example.com', role: 'member' } } })

    await act(async () => {
      screen.getByText('login').click()
    })

    await screen.findByText('user@example.com')
    expect(api.post).toHaveBeenCalledWith('/session', { email: 'user@example.com', password: 'secret' })
  })

  it('login failure sets error and returns false (state not updated with user)', async () => {
    renderWithProvider()

    ;(api.post as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce({ response: { data: { error: 'Invalid' } } })

    await act(async () => {
      screen.getByText('login').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
      expect(screen.getByTestId('user').textContent).toBe('none')
    })
  })

  it('logout clears user and calls API', async () => {
    // Start with a user
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { user: { id: 1, email: 'u@e.com', role: 'member' } } })

    renderWithProvider()
    await screen.findByText('u@e.com')

    await act(async () => {
      screen.getByText('logout').click()
    })

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/session')
      expect(screen.getByTestId('user').textContent).toBe('none')
    })
  })

  it.skip('refresh updates user from API success and handles error by setting null', async () => {
    renderWithProvider()

    // Successful refresh gives a user
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ data: { user: { id: 2, email: 'ref@e.com', role: 'librarian' } } })
    await act(async () => {
      screen.getByText('refresh').click()
    })
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('ref@e.com')
    })

    // Error on refresh resets to null
    ;(api.get as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('nope'))
    await act(async () => {
      screen.getByText('refresh').click()
    })
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('none')
    })
  })
})


