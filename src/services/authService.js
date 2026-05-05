// services/authService.js
import apiClient from "./apiClient";

export const loginUser = async (data) => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const { role, ...bodyData } = data;
  const response = await apiClient.post(
    `/auth/register?role=${role}`,
    bodyData,
  );
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/user");
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post("/auth/refresh", { refreshToken });
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};
