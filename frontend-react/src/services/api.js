import axios from "axios";
import { BASE_URL, API } from "../constants/api";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly cookies
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach access token from localStorage ───────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle token refresh on 401 ───────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If 401 and we haven't already retried this request
    // Skip refresh logic for auth endpoints — a 401 there (wrong credentials,
    // expired reset token, etc.) should bubble up to the caller, not trigger
    // an infinite refresh → redirect loop.
    const isAuthEndpoint = original.url?.includes("/api/auth/");
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}${API.REFRESH}`, {}, { withCredentials: true });
        const newToken = data.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        // Redirect to login without import cycle
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Show toast for non-401 errors (except network errors we handle per-call)
    const message = error.response?.data?.message || "Something went wrong.";
    if (error.response?.status >= 500) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
