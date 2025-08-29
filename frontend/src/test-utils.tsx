import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'

// Custom render function that wraps components in Router context
function renderWithRouter(
  ui: React.ReactElement,
  {
    route = '/',
    ...renderOptions
  }: RenderOptions & { route?: string } = {}
) {
  window.history.pushState({}, 'Test page', route)

  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>,
    renderOptions
  )
}

// Custom render function for components that need BrowserRouter
function renderWithBrowserRouter(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>,
    options
  )
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Export custom render functions
export { renderWithRouter, renderWithBrowserRouter }
