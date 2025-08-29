import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'

const Books = React.lazy(() => import('./pages/Books'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const Borrowings = React.lazy(() => import('./pages/Borrowings'))
const Members = React.lazy(() => import('./pages/Members'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <React.Suspense fallback={<div>Loading…</div>}><Dashboard /></React.Suspense> },
      { path: 'dashboard', element: <React.Suspense fallback={<div>Loading…</div>}><Dashboard /></React.Suspense> },
      { path: 'books', element: <React.Suspense fallback={<div>Loading…</div>}><Books /></React.Suspense> },
      { path: 'borrowings', element: <React.Suspense fallback={<div>Loading…</div>}><Borrowings /></React.Suspense> },
      { path: 'members', element: <React.Suspense fallback={<div>Loading…</div>}><Members /></React.Suspense> },
      { path: 'login', element: <Login /> },
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
)
