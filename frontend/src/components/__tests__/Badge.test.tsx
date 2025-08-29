import { render, screen } from '@testing-library/react'
import React from 'react'
import Badge from '../Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>New</Badge>)
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('applies variant classes', () => {
    render(<Badge variant="success">OK</Badge>)
    const el = screen.getByText('OK')
    expect(el.className).toMatch(/bg-green-100/)
  })
})


