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
  setRole,
  getRole,
  isTokenExpired,
  getSessionUserFromToken,
} from "../../utils/token";
import {
  loginUser,
  registerUser,
  refreshToken as refreshTokenService,
  logoutUser,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      const { accessToken, refreshToken } = event.detail;
      dispatch({
        type: types.REFRESH_TOKEN_SUCCESS,
        payload: { accessToken, refreshToken },
      });
    };

    const handleLogoutEvent = () => {
      clearAuthStorage();
      dispatch({ type: types.LOGOUT });
      window.location.replace("/login");
    };

    window.addEventListener("authTokenRefreshed", handleTokenRefreshed);
    window.addEventListener("authLogout", handleLogoutEvent);
    return () => {
      window.removeEventListener("authTokenRefreshed", handleTokenRefreshed);
      window.removeEventListener("authLogout", handleLogoutEvent);
    };
  }, []);

  // LOGIN
  const login = async (payload) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await loginUser(payload);
      const { accessToken, refreshToken, role } = res;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setRole(role || res.user?.role);

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: {
          ...res,
          user: res.user || (role ? { role } : null),
        },
      });

      return res;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed";

      dispatch({
        type: types.AUTH_FAILURE,
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // REGISTER
  const register = async (payload) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await registerUser(payload);

      dispatch({
        type: types.REGISTER_SUCCESS,
        payload: res,
      });

      return res;
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.msg ||
        err?.message ||
        "Registration failed";

      dispatch({
        type: types.AUTH_FAILURE,
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // REFRESH TOKEN
  const refreshToken = async (refreshTokenValue) => {
    dispatch({ type: types.AUTH_START });

    try {
      const res = await refreshTokenService(refreshTokenValue);
      const { accessToken, refreshToken: newRefreshToken, role } = res;
      setAccessToken(accessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
      if (role) {
        setRole(role);
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
  const logout = async () => {
    const refreshToken = getRefreshToken();

    try {
      await logoutUser(refreshToken);
    } catch {
      // Ignore logout errors and clear local state regardless.
    } finally {
      clearAuthStorage();
      dispatch({ type: types.LOGOUT });
      window.location.replace("/login");
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    dispatch({ type: types.FORGOT_PASSWORD_START });

    try {
      const res = await forgotPasswordService(email);

      dispatch({
        type: types.FORGOT_PASSWORD_SUCCESS,
        payload: res.message || "we will send you a reset link to your email",
      });

      return res;
    } catch (err) {
      dispatch({
        type: types.FORGOT_PASSWORD_ERROR,
        payload:
          err.response?.data?.message ||
          "Failed to process forgot password request",
      });
      throw new Error(
        err.response?.data?.message ||
          "Failed to process forgot password request",
      );
    }
  };

  // RESET PASSWORD
  const resetPassword = async (token, newPassword) => {
    dispatch({ type: types.RESET_PASSWORD_START });

    try {
      const res = await resetPasswordService(token, newPassword);

      dispatch({
        type: types.RESET_PASSWORD_SUCCESS,
        payload: res.message || "Password reset successfully",
      });

      return res;
    } catch (err) {
      dispatch({
        type: types.RESET_PASSWORD_ERROR,
        payload: err.response?.data?.message || "Failed to reset password",
      });
      throw new Error(
        err.response?.data?.message || "Failed to reset password",
      );
    }
  };

  // RESTORE SESSION
  useEffect(() => {
    const restore = async () => {
      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();
        let role = getRole();
        const accessTokenValid = accessToken && !isTokenExpired(accessToken);
        const hasValidSession = accessTokenValid || !!refreshToken;

        if (!hasValidSession) {
          clearAuthStorage();
          dispatch({ type: types.AUTH_READY });
          return;
        }

        let restoredAccessToken = accessToken;
        let restoredRefreshToken = refreshToken;

        if (!accessTokenValid && refreshToken) {
          try {
            const refreshRes = await refreshTokenService(refreshToken);
            restoredAccessToken = refreshRes.accessToken;
            restoredRefreshToken = refreshRes.refreshToken || refreshToken;
            if (refreshRes.role) {
              role = refreshRes.role;
            }
            setAccessToken(restoredAccessToken);
            setRefreshToken(restoredRefreshToken);
            if (role) {
              setRole(role);
            }
          } catch {
            clearAuthStorage();
            dispatch({ type: types.LOGOUT });
            return;
          }
        }

        const sessionUser = getSessionUserFromToken(restoredAccessToken);
        const restoredUser = sessionUser
          ? { ...sessionUser, role: role || sessionUser.role }
          : role
            ? { role }
            : null;

        if (!role && sessionUser?.role) {
          role = sessionUser.role;
          setRole(role);
        }

        dispatch({
          type: types.SESSION_RESTORE_SUCCESS,
          payload: {
            user: restoredUser,
            accessToken: restoredAccessToken,
            refreshToken: restoredRefreshToken,
            role,
          },
        });
      } finally {
        dispatch({ type: types.AUTH_READY });
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
        forgotPassword,
        resetPassword,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
