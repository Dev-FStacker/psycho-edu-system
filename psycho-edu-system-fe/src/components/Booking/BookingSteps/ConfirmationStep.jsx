import { useState, useEffect, useCallback } from "react";
import { useBooking } from "../../../context/BookingContext";
import { getAuthDataFromLocalStorage } from "../../../utils/auth";
import axios from "axios";
import { motion } from "framer-motion";
import { Box, Typography, CircularProgress } from "@mui/material";
import Swal from "sweetalert2";

const swalWithConfig = Swal.mixin({
  confirmButtonColor: "#26A69A",
  cancelButtonColor: "#FF6F61",
  timer: 1500,
  showConfirmButton: false,
  position: "center",
  didOpen: (popup) => {
    popup.style.zIndex = 9999;
  },
});

export const ConfirmationStep = () => {
  const { bookingData } = useBooking();
  const [bookedByDetails, setBookedByDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const authData = getAuthDataFromLocalStorage();

  const fetchBookedByDetails = useCallback(async () => {
    if (!authData.userId) {
      setError("User ID is missing from authentication data.");
      swalWithConfig.fire({
        title: "Error",
        text: "User ID is missing.",
        icon: "error",
      });
      return;
    }

    try {
      const response = await axios.get(
        `https://localhost:7192/api/User/profile?userId=${authData.userId}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.isSuccess && response.data.statusCode === 200) {
        setBookedByDetails(response.data.result);
      } else {
        throw new Error("Failed to fetch bookedBy details.");
      }
    } catch (err) {
      setError(`Error fetching bookedBy details: ${err.message}`);
      swalWithConfig.fire({
        title: "Error",
        text: "Failed to fetch bookedBy details.",
        icon: "error",
      });
    }
  }, [authData.userId, authData.accessToken]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchBookedByDetails();
      setIsLoading(false);
    };
    fetchData();
  }, [fetchBookedByDetails]);

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <CircularProgress size={40} sx={{ color: "#26A69A" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          color: "#333",
          mb: 2,
          textAlign: "center",
        }}
      >
        Booking Summary
      </Typography>
      {error ? (
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          {error}
        </Typography>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              bgcolor: "#F0F8FF",
              border: "1px solid #26A69A",
              borderRadius: "8px",
              p: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  Booking Type:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  {bookingData.userRole === "Parent"
                    ? "Parent Booking"
                    : "Student Booking"}
                </Typography>
              </Box>
              {bookedByDetails && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    Booked By:
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        color: "#333",
                        fontSize: "0.9rem",
                      }}
                    >
                      {bookedByDetails.fullName || "Unknown"} (
                      {bookingData.userRole})
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      Phone: {bookedByDetails.phone || "N/A"}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      Email: {bookedByDetails.email || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              )}
              {bookingData.userRole === "Parent" && bookingData.childName && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    Child:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      color: "#333",
                      fontSize: "0.9rem",
                    }}
                  >
                    {bookingData.childName}{" "}
                    {bookingData.childId ? `(${bookingData.childId})` : ""}
                  </Typography>
                </Box>
              )}
              {bookingData.consultantName && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    Consultant:
                  </Typography>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        color: "#333",
                        fontSize: "0.9rem",
                      }}
                    >
                      {bookingData.consultantName} (
                      {bookingData.consultantType === "homeroom"
                        ? "Homeroom Teacher"
                        : "Counselor"}
                      )
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      Phone: {bookingData.consultantDetails?.phone || "N/A"}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      Email: {bookingData.consultantDetails?.email || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              )}
              {bookingData.date && bookingData.time && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    Date & Time:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      color: "#333",
                      fontSize: "0.9rem",
                    }}
                  >
                    {new Date(bookingData.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    at {bookingData.time}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  Meeting Type:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    color: "#333",
                    fontSize: "0.9rem",
                  }}
                >
                  {bookingData.appointmentType || "Not specified"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              color: "#555",
              fontSize: "0.85rem",
              textAlign: "center",
              mt: 2,
            }}
          >
            Please review your booking details above. Click "Confirm Booking" to
            finalize.
          </Typography>
        </motion.div>
      )}
    </Box>
  );
};
