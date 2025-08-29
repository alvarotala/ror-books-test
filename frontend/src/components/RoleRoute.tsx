import React from "react";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ librarian, member }: { librarian: React.ReactNode; member: React.ReactNode }) {
  const { state } = useAuth();
  if (!state.user) return null;
  return <>{state.user.role === 'librarian' ? librarian : member}</>;
}


