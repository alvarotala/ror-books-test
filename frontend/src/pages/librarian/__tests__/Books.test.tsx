import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Books from '../Books'

vi.mock('../../../api/client', () => {
  const get = vi.fn()
  const post = vi.fn()
  const put = vi.fn()
  const del = vi.fn()
  return { api: { get, post, put, delete: del } }
})

// Mock useAuth
vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ state: { user: { id: 1, email: 'lib@example.com', role: 'librarian' } } }),
}))

import { api } from '../../../api/client'

function setupList(books: any[] = []) {
  ;(api.get as any).mockResolvedValue({ data: books })
  render(<Books />)
}

describe('Librarian Books page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default mock for all API calls to prevent undefined responses
    ;(api.get as any).mockResolvedValue({ data: [] })
    ;(api.post as any).mockResolvedValue({ data: {} })
    ;(api.put as any).mockResolvedValue({ data: {} })
    ;(api.delete as any).mockResolvedValue({ data: undefined })
  })

  it('loads and displays books, allows searching and pagination', async () => {
    setupList([
      { id: 1, title: 'T1', author: 'A1', genre: 'G1', isbn: 'I1', total_copies: 2 },
    ])

    // initial load
    await screen.findByText('T1')

    // search triggers new load
    ;(api.get as any).mockResolvedValueOnce({ data: [] })
    const input = screen.getByPlaceholderText('Search books')
    fireEvent.change(input, { target: { value: 'abc' } })
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))

    // pagination controls should be hidden when fewer than 25 and on page 1
    expect(screen.queryByText('Next')).toBeNull()
  })

  it('toggles create modal and validates client-side, then creates a book', async () => {
    setupList([])
    await waitFor(() => expect(api.get).toHaveBeenCalled())

    fireEvent.click(screen.getByText('New Book'))

    // Try to create with empty fields -> shows errors and does not call API
    fireEvent.click(screen.getByText('Create'))
    expect(await screen.findAllByText(/is required/)).toHaveLength(4)

    // Fill fields
    const inputs = screen.getAllByDisplayValue('')
    const title = inputs[0] as HTMLInputElement
    const author = inputs[1] as HTMLInputElement
    const genre = inputs[2] as HTMLInputElement
    const isbn = inputs[3] as HTMLInputElement
    fireEvent.change(title, { target: { value: 'The Book' } })
    fireEvent.change(author, { target: { value: 'Someone' } })
    fireEvent.change(genre, { target: { value: 'Novel' } })
    fireEvent.change(isbn, { target: { value: '123' } })
    const copies = screen.getByLabelText('Copies') as HTMLInputElement
    fireEvent.change(copies, { target: { value: '3' } })

    ;(api.post as any).mockResolvedValueOnce({ data: { id: 9, title: 'The Book', author: 'Someone', genre: 'Novel', isbn: '123', total_copies: 3 } })
    fireEvent.click(screen.getByText('Create'))
    // simulate reload by triggering search input (which calls API)
    ;(api.get as any).mockResolvedValueOnce({ data: [{ id: 9, title: 'The Book', author: 'Someone', genre: 'Novel', isbn: '123', total_copies: 3 }] })
    fireEvent.change(screen.getByPlaceholderText('Search books'), { target: { value: 'The' } })
    await screen.findByText('The Book')
  })

  it('edits a book with validation, saves and deletes', async () => {
    setupList([{ id: 1, title: 'T1', author: 'A1', genre: 'G1', isbn: 'I1', total_copies: 2 }])
    await screen.findByText('T1')

    // Edit flow
    fireEvent.click(screen.getByText('Edit'))
    const titleInput = screen.getByLabelText('Title') as HTMLInputElement
    fireEvent.change(titleInput, { target: { value: '' } })
    fireEvent.click(screen.getByText('Save'))
    await screen.findByText('Title is required')

    fireEvent.change(titleInput, { target: { value: 'New T' } })
    ;(api.put as any).mockResolvedValueOnce({ data: { id: 1, title: 'New T', author: 'A1', genre: 'G1', isbn: 'I1', total_copies: 2 } })
    fireEvent.click(screen.getByText('Save'))
    await screen.findByText('New T')

    // Delete flow
    vi.spyOn(window, 'confirm').mockReturnValueOnce(true)
    ;(api.delete as any).mockResolvedValueOnce({ data: undefined })
    fireEvent.click(screen.getByText('Delete'))
    await waitFor(() => expect(api.delete).toHaveBeenCalledWith('/books/1'))
  })
})


