import { Link, Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Button from "./components/Button";

export default function App() {
  const { state, logout } = useAuth();
  const location = useLocation();

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-gray-500">Loading…</div>
      </div>
    );
  }

  if (!state.user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  const NavLink = ({ to, children, isRootDashboard = false }: { to: string; children: React.ReactNode; isRootDashboard?: boolean }) => {
    const isActive = isRootDashboard
      ? (location.pathname === '/' || location.pathname === '/dashboard')
      : location.pathname === to;
    return (
      <Link
        to={to}
        className={[
          "rounded-md px-3 py-2 text-sm font-medium transition",
          isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        {children}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {state.user && (
        <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
            <div className="mr-2 text-base font-semibold tracking-tight">Library</div>
            <nav className="flex items-center gap-1">
              <NavLink to="/" isRootDashboard>Dashboard</NavLink>
              <NavLink to="/books">Books</NavLink>
              <NavLink to="/borrowings">Borrowings</NavLink>
              {state.user?.role === 'librarian' && <NavLink to="/members">Members</NavLink>}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" onClick={logout} title={state.user.email}>Logout</Button>
            </div>
          </div>
        </header>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
