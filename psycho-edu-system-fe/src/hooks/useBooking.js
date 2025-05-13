import { useState } from "react";
import { toast } from "react-toastify";
import { bookingService } from "../api/services/booking";

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      await bookingService.createBooking(bookingData);
      toast.success("Booking created successfully!");
      return true;
    } catch (err) {
      setError(err.message);
      toast.error("Failed to create booking");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
};
