/* eslint-disable react/prop-types */
import { createContext, useEffect, useReducer, useState } from "react";
import { LoginService } from "../../api/services/loginService";
import DecodeJWT from "../../utils/decodeJwt";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return { user: null, isAuthenticated: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const decodedData = DecodeJWT(parsedUser.accessToken);
      parsedUser.role = decodedData.role; // Extract role from token
      dispatch({ type: "LOGIN", payload: parsedUser });
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await LoginService.login(email, password);
      const decodedData = DecodeJWT(data.result.accessToken);
      const userData = {
        accessToken: data.result.accessToken,
        role: decodedData.role, // Extract role from token
        username: decodedData.username || data.result.username,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({ type: "LOGIN", payload: userData });

      return decodedData.role;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const loginGoogle = async (idToken) => {
    try {
      const data = await LoginService.loginWithGoogle(idToken);
      const decodedData = DecodeJWT(data.result.accessToken);
      const userData = {
        accessToken: data.result.accessToken,
        role: decodedData.role, // Extract role from token
        username: decodedData.username || data.result.username,
      };
      localStorage.setItem("user", JSON.stringify(userData));
      dispatch({ type: "LOGIN", payload: userData });

      return decodedData.role;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.clear();
    dispatch({ type: "LOGOUT" });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout, loginGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
