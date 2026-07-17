const ACCESS_TOKEN_KEY = "memi_access_token";
const REFRESH_TOKEN_KEY = "memi_refresh_token";
const ROLE_KEY = "memi_role";

export const setAccessToken = (token) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const setRole = (role) => {
  if (role) {
    localStorage.setItem(ROLE_KEY, String(role).toUpperCase());
  }
};

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const removeRole = () => {
  localStorage.removeItem(ROLE_KEY);
};

export const clearAuthStorage = () => {
  removeAccessToken();
  removeRefreshToken();
  removeRole();
};

const parseTokenPayload = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = parseTokenPayload(token);
  if (!payload || typeof payload !== "object") return true;
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

export const getSessionUserFromToken = (token) => {
  const payload = parseTokenPayload(token);
  if (!payload || typeof payload !== "object") return null;

  const roleValue =
    payload.role || payload.userRole || payload.user_role || payload.type;
  const roleText = roleValue ? String(roleValue).toUpperCase() : null;

  const user = {};
  if (payload.sub) user.id = payload.sub;
  if (payload.id) user.id = payload.id;
  if (payload.shipperId) user.shipperId = payload.shipperId;
  if (payload.shipper_id) user.shipperId = payload.shipper_id;
  if (payload.carrierId) user.carrierId = payload.carrierId;
  if (payload.carrier_id) user.carrierId = payload.carrier_id;
  if (payload.email) user.email = payload.email;
  if (payload.username) user.email = payload.username;
  if (roleText) user.role = roleText;

  return Object.keys(user).length > 0 ? user : null;
};
