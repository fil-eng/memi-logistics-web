// AuthProvider.jsx

import { createContext, useReducer, useEffect } from "react";
import { authReducer } from "./authReducer";
import { authInitialState } from "./authInitialState";
import * as types from "./authTypes";
import { setToken, getToken, removeToken } from "../../utils/tokenStorage";
import { loginUser, registerUser, getCurrentUser } from "../../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, authInitialState);

  // LOGIN
  const login = async (data) => {
    dispatch({ type: types.AUTH_START });
    try {
      const res = await loginUser(data);
      setToken(res.data.token);

      dispatch({
        type: types.LOGIN_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: types.AUTH_FAIL,
        payload: err.response?.data?.message || "Login failed",
      });
    }
  };

  // REGISTER
  const register = async (data) => {
    dispatch({ type: types.AUTH_START });
    try {
      const res = await registerUser(data);
      setToken(res.data.token);

      dispatch({
        type: types.REGISTER_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: types.AUTH_FAIL,
        payload: err.response?.data?.message || "Registration failed",
      });
    }
  };

  // LOGOUT
  const logout = () => {
    removeToken();
    dispatch({ type: types.LOGOUT });
  };

  // RESTORE SESSION
  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await getCurrentUser();
        dispatch({
          type: types.LOAD_USER,
          payload: res.data.user,
        });
      } catch {
        removeToken();
        dispatch({ type: types.LOGOUT });
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};