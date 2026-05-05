// AuthProvider.jsx

import { createContext, useReducer, useEffect } from "react";
import { authReducer } from "./authReducer";
import { authInitialState } from "./auth.initialState";
import * as types from "./auth.types";

import {
  setAccessToken,
  getAccessToken,
  clearAuthStorage,
  setRefreshToken,
  getRefreshToken,
  isTokenExpired,
} from "../../utils/token";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  refreshToken as refreshTokenService,
} from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // LOGIN
  const login = async (payload) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await loginUser(payload);
      const { accessToken, refreshToken } = res;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: res,
      });

      return res;
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
      const { accessToken, refreshToken } = res;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);

      dispatch({
        type: types.REGISTER_SUCCESS,
        payload: res,
      });

      return res;
    } catch (err) {
      dispatch({
        type: types.AUTH_FAILURE,
        payload: err.response?.data?.message || "Registration failed",
      });
      throw new Error(err.response?.data?.message || "Registration failed");
    }
  };

  // REFRESH TOKEN
  const refreshToken = async (refreshTokenValue) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await refreshTokenService(refreshTokenValue);
      const { accessToken, refreshToken: newRefreshToken } = res;
      setAccessToken(accessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      dispatch({
        type: types.REFRESH_TOKEN_SUCCESS,
        payload: res,
      });

      return res;
    } catch (err) {
      dispatch({
        type: types.AUTH_FAILURE,
        payload: err.response?.data?.message || "Refresh failed",
      });
      throw new Error(err.response?.data?.message || "Refresh failed");
    }
  };

  // LOGOUT
  const logout = () => {
    clearAuthStorage();
    dispatch({ type: types.LOGOUT });
  };

  // RESTORE SESSION
  useEffect(() => {
    const timeout = setTimeout(() => {
      dispatch({ type: types.AUTH_READY });
    }, 2000); // 2 second timeout

    const restore = async () => {
      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (accessToken && !isTokenExpired(accessToken)) {
          // Access token is valid, restore session
          try {
            const userRes = await getCurrentUser();
            const user = userRes;
            dispatch({
              type: types.SESSION_RESTORE_SUCCESS,
              payload: {
                user,
                accessToken,
                refreshToken,
              },
            });
          } catch (err) {
            // If getCurrentUser fails, try refresh
            if (refreshToken) {
              try {
                const refreshRes = await refreshTokenService(refreshToken);
                const { accessToken: newAccess, refreshToken: newRefresh } =
                  refreshRes;
                setAccessToken(newAccess);
                if (newRefresh) setRefreshToken(newRefresh);
                const userRes = await getCurrentUser();
                const user = userRes;
                dispatch({
                  type: types.SESSION_RESTORE_SUCCESS,
                  payload: {
                    user,
                    accessToken: newAccess,
                    refreshToken: newRefresh || refreshToken,
                  },
                });
              } catch {
                clearAuthStorage();
                dispatch({ type: types.LOGOUT });
              }
            } else {
              clearAuthStorage();
              dispatch({ type: types.LOGOUT });
            }
          }
        } else if (refreshToken) {
          // Access token expired or missing, use refresh token
          try {
            const refreshRes = await refreshTokenService(refreshToken);
            const { accessToken: newAccess, refreshToken: newRefresh } =
              refreshRes;
            setAccessToken(newAccess);
            if (newRefresh) setRefreshToken(newRefresh);
            const userRes = await getCurrentUser();
            const user = userRes;
            dispatch({
              type: types.SESSION_RESTORE_SUCCESS,
              payload: {
                user,
                accessToken: newAccess,
                refreshToken: newRefresh || refreshToken,
              },
            });
          } catch {
            clearAuthStorage();
            dispatch({ type: types.LOGOUT });
          }
        } else {
          dispatch({ type: types.AUTH_READY });
        }
      } finally {
        clearTimeout(timeout);
      }
    };

    restore();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        // expose both the raw `state` and top-level shortcuts for
        // existing consumers that destructure fields directly.
        ...state,
        state,
        login,
        register,
        refreshToken,
        logout,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
