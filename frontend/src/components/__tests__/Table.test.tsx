import { render, screen, within } from '@testing-library/react'
import React from 'react'
import Table, { THead, TBody, TR, TH, TD } from '../Table'

describe('Table', () => {
  it('renders head and body rows', () => {
    render(
      <Table>
        <THead>
          <TR>
            <TH>Col</TH>
          </TR>
        </THead>
        <TBody>
          <TR>
            <TD>Val</TD>
          </TR>
        </TBody>
      </Table>
    )
    const table = screen.getByRole('table')
    expect(within(table).getByText('Col')).toBeInTheDocument()
    expect(within(table).getByText('Val')).toBeInTheDocument()
  })
})


