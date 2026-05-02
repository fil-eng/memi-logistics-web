// services/authService.js
import apiClient from "./apiClient";
import { setAccessToken } from "../utils/token";

export const loginUser = (data) => apiClient.post("/auth/login", data);

export const registerUser = (data) => {
  const { role, ...bodyData } = data;
  return apiClient.post(`/auth/register?role=${role}`, bodyData);
};

export const getCurrentUser = () => apiClient.get("/auth/user");

export const refreshUserToken = async () => {
  const response = await apiClient.post("/auth/refresh");
  const token = response.data?.token;

  if (!token) {
    throw new Error("Refresh failed: no access token returned");
  }

  setAccessToken(token);
  return response;
};

export const logoutUser = () => apiClient.post("/auth/logout");
