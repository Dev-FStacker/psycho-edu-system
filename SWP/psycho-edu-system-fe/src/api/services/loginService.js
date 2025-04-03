import axios from "axios";
const BASE_URL = "https://localhost:7192/";
export const LoginService = {
  login: async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}api/Login/login`, {
        account: email,
        password: password,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
        throw error.response?.data?.message || "Login failed";
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },
  loginWithGoogle: async (idToken) => {
    try {
      const response = await axios.post(`${BASE_URL}api/Login/signin-google`, {
        idToken: idToken,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
        throw error.response?.data?.message || "Login failed";
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },
};
