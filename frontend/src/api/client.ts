import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export async function ensureCsrfToken(): Promise<void> {
  try {
    const res = await api.get("/csrf");
    const token: string | undefined = res.data?.csrfToken;
    if (token) {
      api.defaults.headers.common["X-CSRF-Token"] = token;
    }
  } catch (err) {
    // No-op; server may already include CSRF cookie
  }
}


