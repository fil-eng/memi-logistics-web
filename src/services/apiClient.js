// services/apiClient.js
import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthStorage,
} from "../utils/token";

const baseURL = import.meta.env.VITE_API_URL_BASEURL;;
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve(token);
  });
  refreshQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true },
        );

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;

        if (!accessToken) {
          throw new Error("Refresh failed");
        }

        setAccessToken(accessToken);
        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
        }

        window.dispatchEvent(
          new CustomEvent("authTokenRefreshed", {
            detail: {
              accessToken,
              refreshToken: newRefreshToken || refreshToken,
            },
          }),
        );

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthStorage();
        window.dispatchEvent(new Event("authLogout"));
        window.location.href = "/login";
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      if (!error.response.data?.message) {
        error.response.data = {
          ...error.response.data,
          message: "You do not have permission to access this page.",
        };
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
