import axios from "axios";

const baseURL = import.meta.env["VITE_API_BASE_URL"] ?? "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ledgerly.access");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * On a 401, try to refresh the access token once and replay the original
 * request. If refresh also fails, force a clean re-login instead of leaving
 * the app in a half-authenticated state.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = localStorage.getItem("ledgerly.refresh");
  if (!refresh) return null;

  try {
    const response = await axios.post(`${baseURL}/auth/refresh/`, { refresh });
    const access = response.data.access;
    if (!access) return null;
    localStorage.setItem("ledgerly.access", access);
    return access;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original?._retried || original?.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    original._retried = true;

    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });

    const access = await refreshInFlight;

    if (!access) {
      localStorage.removeItem("ledgerly.access");
      localStorage.removeItem("ledgerly.refresh");
      window.location.href = "/";
      return Promise.reject(error);
    }

    original.headers.Authorization = `Bearer ${access}`;
    return api(original);
  },
);

export default api;