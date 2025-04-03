import api from "../axios";
import { ENDPOINTS } from "../endpoints";

export const bookingService = {
  createBooking: async (bookingData) => {
    return await api.post(ENDPOINTS.BOOKINGS, bookingData);
  },

  getBookingsByUser: async (userId) => {
    return await api.get(`${ENDPOINTS.BOOKINGS}/user/${userId}`);
  },

  cancelBooking: async (bookingId) => {
    return await api.delete(`${ENDPOINTS.BOOKINGS}/${bookingId}`);
  },
};
