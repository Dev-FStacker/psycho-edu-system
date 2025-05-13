import axios from "axios";
const BASE_URL = "https://localhost:7192/";
import DecodeJWT from "../../utils/decodeJwt";

export const UserService = {
  getChildren: async () => {
    try {
      const token = localStorage.getItem("user");
      const formattedToken = JSON.parse(token);
      const accessToken = formattedToken.accessToken;
      const userData = DecodeJWT(accessToken);

      const response = await axios.get(
        `${BASE_URL}api/relationships/parent/${userData.userId}`
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },
  getClass: async () => {
    try {
      const token = localStorage.getItem("user");
      const formattedToken = JSON.parse(token);
      const accessToken = formattedToken.accessToken;
      const userData = DecodeJWT(accessToken);

      const response = await axios.get(
        `${BASE_URL}api/teachers/${userData.userId}/classes`
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },
  getStudentsFromClassId: async (classId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/teachers/${classId}/students`
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up request:", error.message);
      }
      throw error;
    }
  },
};
