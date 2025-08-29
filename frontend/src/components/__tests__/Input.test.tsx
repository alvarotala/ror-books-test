import { render, screen } from '@testing-library/react'
import React from 'react'
import Input from '../Input'

describe('Input', () => {
  it('renders label and hint', () => {
    render(<Input label="Email" hint="We never share it" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('We never share it')).toBeInTheDocument()
  })

  it('renders error and applies error classes', () => {
    render(<Input label="Email" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    const input = screen.getByLabelText(/email/i, { selector: 'input' }) as HTMLInputElement
    expect(input.className).toMatch(/border-red-500/)
  })
})


