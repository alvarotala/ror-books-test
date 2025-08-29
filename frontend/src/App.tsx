import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { state, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <nav className="p-3 border-b flex items-center gap-4">
        <Link to="/">Books</Link>
        <Link to="/dashboard">Dashboard</Link>
        <div className="ml-auto">
          {state.user ? (
            <button className="text-blue-600" onClick={logout}>Logout ({state.user.email})</button>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
