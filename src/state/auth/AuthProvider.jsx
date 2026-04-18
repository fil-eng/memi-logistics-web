// AuthProvider.jsx

import { createContext, useReducer, useEffect } from "react";
import { authReducer } from "./authReducer"
import { authInitialState } from "./authInitialState";
import * as types from "./authTypes";

import { setToken, getToken, removeToken } from "../../utils/tokenStorage";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);
  // LOGIN
 const login = async (payload) => {
  dispatch({ type: types.AUTH_START });
  
  try {
    const res = await loginUser(payload);
    setToken(res.data.token);
    
    dispatch({
      type: types.LOGIN_SUCCESS,
      payload: res.data,
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: types.AUTH_ERROR,
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
    setToken(res.data.token);

    dispatch({
      type: types.REGISTER_SUCCESS,
      payload: res.data,
    });

    return res.data;
  } catch (err) {
    dispatch({
      type: types.AUTH_ERROR,
      payload: err.response?.data?.message || "Registration failed",
    });
    throw new Error(err.response?.data?.message || "Registration failed");
  }
};

  // LOGOUT
  const logout = () => {
    removeToken();
    dispatch({ type: types.LOGOUT });
  };

  // RESTORE SESSION
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await getCurrentUser();

        dispatch({
          type: types.LOAD_USER_SUCCESS,
          payload: res.data.user,
        });
      } catch {
        removeToken();
        dispatch({ type: types.LOGOUT });
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
        logout,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};