// services/authService.js
import apiClient from "./apiClient";
import { getRole } from "../utils/token";

export const loginUser = async (data) => {
  const response = await apiClient.post("/auth/login", data);
  return response.data;
};

export const registerUser = async (data) => {
  const { email, password, role } = data;
  const normalizedRole = role ? role.toLowerCase() : "";
  const response = await apiClient.post(
    `/auth/register?role=${encodeURIComponent(normalizedRole)}`,
    {
      email,
      password,
    },
  );
  return response.data;
};

export const getCurrentUser = async () => {
  const role = getRole()?.toLowerCase();

  if (role === "shipper") {
    const response = await apiClient.get("/shippers/profile/me");
    return response.data;
  }

  if (role === "carrier") {
    const response = await apiClient.get("/carriers/profile/me");
    return response.data;
  }

  throw new Error("Unable to determine current user role for profile lookup.");
};

export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post("/auth/refresh", { refreshToken });
  return response.data;
};

export const logoutUser = async (refreshToken) => {
  const response = await apiClient.post(
    "/auth/logout",
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post(
    "/auth/forgot-password",
    { email },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await apiClient.post(
    "/auth/reset-password",
    { token, newPassword },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};
