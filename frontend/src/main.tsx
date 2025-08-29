import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'

const LibrarianBooks = React.lazy(() => import('./pages/librarian/Books'))
const LibrarianDashboard = React.lazy(() => import('./pages/librarian/Dashboard'))
const LibrarianBorrowings = React.lazy(() => import('./pages/librarian/Borrowings'))
const LibrarianMembers = React.lazy(() => import('./pages/librarian/Members'))
const Account = React.lazy(() => import('./pages/Account'))
const MemberDashboard = React.lazy(() => import('./pages/member/Dashboard'))
const MemberBooks = React.lazy(() => import('./pages/member/Books'))
const MemberBorrowings = React.lazy(() => import('./pages/member/Borrowings'))
import RoleRoute from './components/RoleRoute'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <React.Suspense fallback={<div>Loading…</div>}><RoleRoute librarian={<LibrarianDashboard />} member={<MemberDashboard />} /></React.Suspense> },
      { path: 'dashboard', element: <React.Suspense fallback={<div>Loading…</div>}><RoleRoute librarian={<LibrarianDashboard />} member={<MemberDashboard />} /></React.Suspense> },
      { path: 'books', element: <React.Suspense fallback={<div>Loading…</div>}><RoleRoute librarian={<LibrarianBooks />} member={<MemberBooks />} /></React.Suspense> },
      { path: 'borrowings', element: <React.Suspense fallback={<div>Loading…</div>}><RoleRoute librarian={<LibrarianBorrowings />} member={<MemberBorrowings />} /></React.Suspense> },
      { path: 'members', element: <React.Suspense fallback={<div>Loading…</div>}><LibrarianMembers /></React.Suspense> },
      { path: 'account', element: <React.Suspense fallback={<div>Loading…</div>}><Account /></React.Suspense> },
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
