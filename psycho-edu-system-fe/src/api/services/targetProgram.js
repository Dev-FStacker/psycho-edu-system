import axios from "axios";
import DecodeJWT from "../../utils/decodeJwt";

const BASE_URL = "https://localhost:7192/";

export const TargetProgramService = {
  assignStudentToTargetProgram: async (data) => {
    try {
      const token = localStorage.getItem("user");
      if (!token) {
        throw new Error("No authentication token found.");
      }

      const formattedToken = JSON.parse(token);
      const accessToken = formattedToken.accessToken;

      const userData = DecodeJWT(accessToken);
      const studentId = userData?.userId;

      if (!studentId) {
        throw new Error("UserId not found in token.");
      }

      const requestData = {
        studentId: studentId,
        anxiety: data["Lo Âu"],
        depression: data["Trầm Cảm"],
        stress: data["Căng Thẳng"],
      };

      const response = await axios.post(
        `${BASE_URL}api/TargetProgram/assign`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      );

      return response.data;
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
  getTargetPrograms: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${BASE_URL}api/TargetProgram/list${
        queryParams ? `?${queryParams}` : ""
      }`;

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching target programs:", error);
      throw error;
    }
  },
  getTargetProgramsByUserId: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const token = localStorage.getItem("user");
      const formattedToken = JSON.parse(token);
      const accessToken = formattedToken.accessToken;
      const userData = DecodeJWT(accessToken);
      const url = `${BASE_URL}api/TargetProgram/get-programs/${
        userData.userId
      }/${queryParams ? `?${queryParams}` : ""}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching target programs:", error);
      throw error;
    }
  },
  getAvailableCounselors: async (selectedDateTime) => {
    try {
      const response = await axios.get(
        `https://localhost:7192/api/TargetProgram/counselors?selectedDateTime=${selectedDateTime}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available counselors:", error);
      return null;
    }
  },
  createProgram: async (data) => {
    const program = {
      name: data.name,
      description: data.description,
      minPoint: data.minPoint,
      capacity: data.capacity,
      dimensionId: parseInt(data.dimensionId, 10),
      counselorId: data.counselors.length > 0 ? data.counselors[0] : null,
      startDate: data.day + "T" + data.time,
    };
    try {
      const response = await axios.post(
        `${BASE_URL}api/TargetProgram/create`,
        program
      );
      return response.data;
    } catch (error) {
      console.error("Error: ", error);
      return null;
    }
  },
  registerTargetProgram: async (programId) => {
    try {
      const token = localStorage.getItem("user");
      const formattedToken = JSON.parse(token);
      const accessToken = formattedToken.accessToken;
      const userData = DecodeJWT(accessToken);
      const registeredForm = {
        userId: userData.userId,
        programId: programId,
      };
      const response = await axios.post(
        `${BASE_URL}api/TargetProgram/register`,
        registeredForm
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  getEnrolledStudents: async (programId, page) => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/TargetProgram/students/${programId}?page=${page}&pageSize=10`
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  updateStudentAttendance: async (data) => {
    try {
      const response = await axios.post(
        `${BASE_URL}api/TargetProgram/attendance/update`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
