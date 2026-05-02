// AuthProvider.jsx

import { createContext, useReducer, useEffect } from "react";
import { authReducer } from "./authReducer";
import { authInitialState } from "./auth.initialState";
import * as types from "./auth.types";

import {
  setAccessToken,
  getAccessToken,
  removeAccessToken,
  clearAuthStorage,
} from "../../utils/token";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  refreshUserToken,
} from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // LOGIN
  const login = async (payload) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await loginUser(payload);
      setAccessToken(res.data.token);

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: types.AUTH_FAILURE,
        payload: err.response?.data?.message || "Login failed",
      });
      throw new Error(err.response?.data?.message || "Login failed");
    }
  };

  // REGISTER
  const register = async (payload) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await registerUser(payload);
      setAccessToken(res.data.token);

      dispatch({
        type: types.REGISTER_SUCCESS,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: types.AUTH_FAILURE,
        payload: err.response?.data?.message || "Registration failed",
      });
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  // REFRESH TOKEN
  const refreshToken = async () => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await refreshUserToken();
      setAccessToken(res.data.token);

      dispatch({
        type: types.REFRESH_TOKEN_SUCCESS,
        payload: res.data,
      });

      return res.data;
    } catch (err) {
      dispatch({
        type: types.AUTH_FAILURE,
        payload: err.response?.data?.message || "Refresh failed",
      });
      throw new Error(err.response?.data?.message || "Refresh failed");
    }
  };

  // LOAD CURRENT USER
  const loadCurrentUser = async () => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await getCurrentUser();

      dispatch({
        type: types.LOAD_CURRENT_USER,
        payload: res.data.user,
      });

      return res.data.user;
    } catch (err) {
      dispatch({
        type: types.AUTH_FAILURE,
        payload: err.response?.data?.message || "Failed to load user",
      });
      throw new Error(err.response?.data?.message || "Failed to load user");
    }
  };

  // LOGOUT
  const logout = () => {
    clearAuthStorage();
    dispatch({ type: types.LOGOUT });
  };

  // RESTORE SESSION
  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken();
      if (!token) {
        dispatch({ type: types.AUTH_READY });
        return;
      }

      try {
        await loadCurrentUser();
      } catch {
        try {
          await refreshToken();
          await loadCurrentUser();
        } catch {
          clearAuthStorage();
          dispatch({ type: types.LOGOUT });
        }
      }
    };

    restore();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        refreshToken,
        loadCurrentUser,
        logout,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
