import axios from "axios";

const BASE_URL = "https://localhost:7192/";

const adminService = {
  getTotalUsers: async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/admin/total-users`, {
        httpsAgent: { rejectUnauthorized: false },
      });
      if (response.status === 200) {
        return response.data.result; // Assuming the API returns { result: value }
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

  getTotalParents: async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/admin/total-parents`, {
        httpsAgent: { rejectUnauthorized: false },
      });
      if (response.status === 200) {
        return response.data.result;
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

  getTotalClasses: async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/admin/total-classes`, {
        httpsAgent: { rejectUnauthorized: false },
      });
      if (response.status === 200) {
        return response.data.result;
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

  getTotalTargetPrograms: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/admin/total-target-programs`,
        {
          httpsAgent: { rejectUnauthorized: false },
        }
      );
      if (response.status === 200) {
        return response.data.result;
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

  getTotalAppointments: async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/admin/total-appointments`,
        {
          httpsAgent: { rejectUnauthorized: false },
        }
      );
      if (response.status === 200) {
        return response.data.result;
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
  getUpcomingAppointments: async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/admin/upcoming-appointments`, {
        httpsAgent: { rejectUnauthorized: false },
      });
      if (response.status === 200) {
        return response.data.result; // Returns list of appointments
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

export default adminService;
