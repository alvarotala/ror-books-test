import React, { createContext, useContext, useEffect, useReducer } from "react";
import { api, ensureCsrfToken } from "../api/client";

type User = {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "librarian" | "member";
};

type State = {
  user: User | null;
  loading: boolean;
  error?: string;
};

type Action =
  | { type: "loading" }
  | { type: "loaded"; user: User | null }
  | { type: "error"; error: string };

const AuthContext = createContext<{
  state: State;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
} | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: undefined };
    case "loaded":
      return { ...state, loading: false, user: action.user };
    case "error":
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });

  useEffect(() => {
    (async () => {
      await ensureCsrfToken();
      try {
        const res = await api.get("/session/current");
        dispatch({ type: "loaded", user: res.data?.user ?? null });
      } catch {
        dispatch({ type: "loaded", user: null });
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "loading" });
    await ensureCsrfToken();
    try {
      const res = await api.post("/session", { email, password });
      dispatch({ type: "loaded", user: res.data?.user ?? null });
      return true;
    } catch (e: any) {
      dispatch({ type: "error", error: e?.response?.data?.error || e?.message || "Login failed" });
      return false;
    }
  };

  const logout = async () => {
    dispatch({ type: "loading" });
    await ensureCsrfToken();
    try {
      await api.delete("/session");
    } finally {
      dispatch({ type: "loaded", user: null });
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


