// auth.reducer.js

import * as types from "./auth.types";

export const authReducer = (state, action) => {
  switch (action.type) {
    case types.AUTH_START:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
        successMessage: null,
      };

    case types.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        role: action.payload.user?.role || null,
        isAuthenticated: true,
        isInitialized: true,
        errorMessage: null,
        successMessage: "Login successful",
      };

    case types.REGISTER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        role: action.payload.user?.role || null,
        isAuthenticated: true,
        isInitialized: true,
        errorMessage: null,
        successMessage: "Registration successful",
      };

    case types.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken || state.refreshToken,
        isAuthenticated: true,
        errorMessage: null,
      };

    case types.SESSION_RESTORE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        role: action.payload.user?.role || null,
        isAuthenticated: true,
        isInitialized: true,
        errorMessage: null,
      };

    case types.AUTH_FAILURE:
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        errorMessage: action.payload,
        successMessage: null,
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false,
      };

    case types.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isInitialized: true,
        errorMessage: null,
        successMessage: null,
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false,
      };

    case types.CLEAR_FEEDBACK:
      return {
        ...state,
        errorMessage: null,
        successMessage: null,
      };

    case types.AUTH_READY:
      return {
        ...state,
        isInitialized: true,
        isLoading: false,
      };

    default:
      return state;
  }
};
