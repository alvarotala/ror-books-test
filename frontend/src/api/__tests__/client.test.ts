import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ensureCsrfToken } from '../client'

describe('ensureCsrfToken', () => {
  beforeEach(() => {
    // Reset header before each test
    // @ts-expect-error dynamic index
    api.defaults.headers.common['X-CSRF-Token'] = undefined
  })

  it('sets X-CSRF-Token header when server returns a token', async () => {
    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { csrfToken: 'test-token' } } as any)

    await ensureCsrfToken()

    expect(getSpy).toHaveBeenCalledWith('/csrf')
    // @ts-expect-error dynamic index
    expect(api.defaults.headers.common['X-CSRF-Token']).toBe('test-token')
  })

  it('does not throw and leaves header unchanged when request fails', async () => {
    // Set a pre-existing header
    // @ts-expect-error dynamic index
    api.defaults.headers.common['X-CSRF-Token'] = 'existing'

    const getSpy = vi.spyOn(api, 'get').mockRejectedValueOnce(new Error('network'))

    await ensureCsrfToken()

    expect(getSpy).toHaveBeenCalledWith('/csrf')
    // Header remains unchanged
    // @ts-expect-error dynamic index
    expect(api.defaults.headers.common['X-CSRF-Token']).toBe('existing')
  })
})


