// authReducer.js

import {
  AUTH_START,
  LOGIN_SUCCESS,
  REGISTER_SUCCESS,
  AUTH_FAIL,
  LOGOUT,
  LOAD_USER,
  CLEAR_MESSAGES,
} from "./authTypes";

export const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_START:
      return {
        ...state,
        loading: true,
        error: null,
        successMessage: null,
      };

    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null,
      };

    case LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };

    case AUTH_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null,
      };

    case LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };

    case CLEAR_MESSAGES:
      return {
        ...state,
        error: null,
        successMessage: null,
      };

    default:
      return state;
  }
};