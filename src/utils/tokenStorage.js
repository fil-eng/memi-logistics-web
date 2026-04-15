// utils/tokenStorage.js

export const setToken = (token) => {
  localStorage.setItem("memi_token", token);
};

export const getToken = () => {
  return localStorage.getItem("memi_token");
};

export const removeToken = () => {
  localStorage.removeItem("memi_token");
};