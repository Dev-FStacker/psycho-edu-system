import axios from "axios";
import { parseISO, startOfDay, format } from "date-fns";
import { getAuthDataFromLocalStorage } from "../utils/auth";

const API_BASE_URL = "https://localhost:7192/api";
const authData = getAuthDataFromLocalStorage();
const dimensions = [
  { id: 1, name: "Lo Âu" },
  { id: 2, name: "Trầm Cảm" },
  { id: 3, name: "Căng Thẳng" },
];

const apiService = {
  fetchUserProfile: async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/User/profile?userId=${userId}`,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    if (!response.data.isSuccess) {
      throw new Error(response.data.message || "Failed to fetch user profile");
    }
    return {
      ...response.data.result,
      userId: userId,
    };
  },

  fetchAppointments: async (userId, date) => {
    try {
      const formattedDate = format(new Date(date), "yyyy-MM-dd");
      const url = `${API_BASE_URL}/appointments/students/${userId}/appointments?selectedDate=${formattedDate}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authData.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.isSuccess && Array.isArray(response.data.result)) {
        const appointments = response.data.result.map((appointment) => {
          let parsedDate;
          try {
            if (appointment.date.includes("/")) {
              parsedDate = parseISO(
                appointment.date.split("/").reverse().join("-")
              );
            } else {
              parsedDate = parseISO(appointment.date);
            }
          } catch (error) {}
          const localDate = startOfDay(parsedDate);

          return {
            id: appointment.appointmentId,
            studentId: appointment.studentId || userId,
            appointmentFor: appointment.appointmentFor || "Unknown",
            bookedBy: appointment.bookedBy || "Unknown",
            meetingWith: appointment.meetingWith || "Unknown",
            type: appointment.isOnline ? "Online" : "Offline",
            date: localDate,
            slot: appointment.slotId || 0,
            status: appointment.isCancelled
              ? "Cancelled"
              : appointment.isCompleted
              ? "Completed"
              : "Scheduled",
            notes: appointment.notes || "",
            appointmentId: appointment.appointmentId,
            isCancelled: appointment.isCancelled || false,
            googleMeetURL: appointment.googleMeetURL || null,
          };
        });
        return appointments;
      } else {
      }
    } catch (error) {
      console.error("Error fetching appointments:", error.response || error);
      throw new Error(
        "Failed to fetch appointments: " +
          (error.response?.status || error.message)
      );
    }
  },
  fetchUserSchedules: async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/Schedule/user-schedules/${userId}`,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    return response.data;
  },

  fetchConsultantSlots: async (consultantId, date) => {
    const response = await axios.get(
      `${API_BASE_URL}/User/${consultantId}/slots?selectedDate=${date}`,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    return response.data.result || [];
  },

  bookSlots: async (payload) => {
    const response = await axios.post(
      `${API_BASE_URL}/Schedule/book-slots`,
      payload,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    return response.data;
  },

  fetchConsultantAppointments: async (teacherId, date) => {
    const response = await axios.get(
      `${API_BASE_URL}/appointments/consultants/${teacherId}/appointments?selectedDate=${date}`,
      { headers: { Authorization: `Bearer ${authData.accessToken}` } }
    );
    return response.data.result || [];
  },

  cancelAppointment: async (appointmentId) => {
    const response = await axios.get(
      `${API_BASE_URL}/appointments/${appointmentId}/cancellation`,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    return response.data;
  },

  createTargetProgram: async (data) => {
    const response = await axios.post(
      `${API_BASE_URL}/TargetProgram/create`,
      data,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    return response.data;
  },

  getAvailableCounselors: async (dateTime) => {
    const response = await axios.get(
      `${API_BASE_URL}/TargetProgram/available-counselors?dateTime=${dateTime}`,
      {
        headers: { Authorization: `Bearer ${authData.accessToken}` },
      }
    );
    return response.data.result || [];
  },

  checkUserExistence: async (email) => {
    try {
      if (!authData || !authData.accessToken) {
        throw new Error("Authentication required. Please log in.");
      }
      const response = await axios.get(
        `${API_BASE_URL}/User/check-existence?userName=dummy&email=${email}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error checking user existence:", error);
      throw error;
    }
  },

  createUserAccount: async (userData) => {
    try {
      if (!authData || !authData.accessToken) {
        throw new Error("Authentication required. Please log in.");
      }
      const response = await axios.post(
        `${API_BASE_URL}/User/create-account`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.message) {
        return response.data;
      } else {
        throw new Error("Failed to create account");
      }
    } catch (error) {
      console.error("Error creating user account:", error);
      throw error;
    }
  },

  fetchAvailableSlots: async (date) => {
    try {
      if (!authData || !authData.accessToken) {
        throw new Error("Authentication required. Please log in.");
      }
      const response = await axios.get(
        `${API_BASE_URL}/Schedule/available-slots/${date}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data;
      } else {
        throw new Error(
          "Failed to fetch available slots or invalid data format"
        );
      }
    } catch (error) {
      throw new Error(error.message || "Error fetching available slots");
    }
  },

  fetchParentChildren: async (parentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/relationships/parent/${parentId}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.result || response.data || [];
    } catch (error) {
      console.error("Error fetching parent children:", error);
      throw error;
    }
  },

  bookAppointment: async (appointmentData) => {
    try {
      const { bookedBy, appointmentFor, meetingWith, date, slotId, isOnline } =
        appointmentData;
      if (!bookedBy || !appointmentFor || !meetingWith || !date || !slotId) {
        throw new Error("Missing required fields in appointment data");
      }
      let formattedDate;
      try {
        const parsedDate = parseISO(date);
        formattedDate = format(parsedDate, "yyyy-MM-dd");
      } catch (error) {
        throw new Error("Invalid date format. Please use YYYY-MM-DD");
      }
      const payload = {
        bookedBy,
        appointmentFor,
        meetingWith,
        date: formattedDate,
        slotId: Number(slotId),
        isOnline: Boolean(isOnline),
      };
      const response = await axios.post(
        `${API_BASE_URL}/appointments`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authData.accessToken}`,
          },
        }
      );
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || "Failed to book appointment");
      }
      return {
        isSuccess: true,
        message: response.data.message || "Booking successful",
        result: {
          appointmentId: response.data.result?.appointmentId || null,
          bookedBy: payload.bookedBy,
          appointmentFor: payload.appointmentFor,
          meetingWith: payload.meetingWith,
          date: payload.date,
          slotId: payload.slotId,
          isOnline: payload.isOnline,
        },
      };
    } catch (error) {
      console.error("Error booking appointment:", error);
      throw {
        statusCode: error.response?.data?.statusCode || 500,
        message:
          error.response?.data?.message ||
          error.message ||
          "Error booking appointment",
        isSuccess: false,
        result: null,
      };
    }
  },

  blog: {
    fetchBlogs: async (pageNumber = 1, pageSize = 5) => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/BlogPost/paged?pageNumber=${pageNumber}&pageSize=${pageSize}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (response.status === 200) {
          const { blogs, totalPages, totalRecords } = response.data;
          return {
            isSuccess: true,
            result: blogs.map((blog) => ({
              id: blog.blogId,
              title: blog.title,
              content: blog.content,
              category: blog.dimensionName,
              createdAt: format(new Date(blog.createdAt), "yyyy-MM-dd"),
              excerpt: blog.content.substring(0, 100) + "...",
            })),
            pagination: { pageNumber, pageSize, totalPages, totalRecords },
          };
        }
        throw new Error("Failed to fetch blogs");
      } catch (error) {
        console.error("Error fetching blogs:", error);
        throw new Error(
          error.response?.data?.message || "Failed to fetch blogs"
        );
      }
    },

    fetchBlogById: async (id) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/BlogPost/${id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
          const blog = response.data;
          return {
            isSuccess: true,
            result: {
              id: blog.blogId,
              title: blog.title,
              content: blog.content,
              category: blog.dimensionName,
              createdAt: format(new Date(blog.createdAt), "yyyy-MM-dd"),
              excerpt: blog.content.substring(0, 100) + "...",
            },
          };
        }
        throw new Error("Blog not found");
      } catch (error) {
        console.error("Error fetching blog by ID:", error);
        throw new Error(
          error.response?.data?.message || "Failed to fetch blog"
        );
      }
    },

    createBlog: async (blogData) => {
      try {
        const payload = {
          title: blogData.title,
          content: blogData.content,
          dimensionId: Number(blogData.dimensionId),
        };
        const response = await axios.post(`${API_BASE_URL}/BlogPost`, payload, {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200 || response.status === 201) {
          const blog = response.data;
          return {
            isSuccess: true,
            message: "Blog created successfully",
            result: {
              id: blog.blogId,
              title: blog.title,
              content: blog.content,
              category: blog.dimensionName,
              createdAt: format(new Date(blog.createdAt), "yyyy-MM-dd"),
              excerpt: blog.content.substring(0, 100) + "...",
            },
          };
        }
        throw new Error("Failed to create blog");
      } catch (error) {
        console.error("Error creating blog:", error);
        throw new Error(
          error.response?.data?.message || "Failed to create blog"
        );
      }
    },

    updateBlog: async (id, blogData) => {
      try {
        const payload = {
          title: blogData.title,
          content: blogData.content,
          dimensionId: Number(blogData.dimensionId),
        };
        const response = await axios.put(
          `${API_BASE_URL}/BlogPost/${id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200 || response.status === 204) {
          const updatedCategory = dimensions.find(
            (dim) => dim.id === Number(blogData.dimensionId)
          )?.name;
          return {
            isSuccess: true,
            message: "Blog updated successfully",
            result: {
              id,
              title: blogData.title,
              content: blogData.content,
              category: updatedCategory,
              createdAt: blogData.createdAt || format(new Date(), "yyyy-MM-dd"),
              excerpt: blogData.content.substring(0, 100) + "...",
            },
          };
        }
        throw new Error("Failed to update blog");
      } catch (error) {
        console.error("Error updating blog:", error);
        throw new Error(
          error.response?.data?.message || "Failed to update blog"
        );
      }
    },

    deleteBlog: async (id) => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/BlogPost/${id}`, {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        });
        if (response.status === 200 || response.status === 204) {
          return { isSuccess: true, message: "Blog deleted successfully" };
        }
        throw new Error("Failed to delete blog");
      } catch (error) {
        console.error("Error deleting blog:", error);
        throw new Error(
          error.response?.data?.message || "Failed to delete blog"
        );
      }
    },

    getDimensions: () => dimensions,
  },
};

export default apiService;
