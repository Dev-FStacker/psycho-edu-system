import { useState, useEffect, useCallback, useMemo } from "react";
import { useBooking } from "../../../context/BookingContext";
import { getAuthDataFromLocalStorage } from "../../../utils/auth";
import { motion } from "framer-motion";
import axios from "axios";
import { Card, CardContent, Typography, Box } from "@mui/material";
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

export const ConsultantTypeSelection = () => {
  const { updateBookingData, bookingData, isParent } = useBooking();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const authData = useMemo(() => getAuthDataFromLocalStorage(), []);
  const userId = authData?.userId;

  const fetchHomeroomTeacher = useCallback(
    async (userId) => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://localhost:7192/api/User/${userId}/class`,
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data.isSuccess && response.data.statusCode === 200) {
          return response.data.result.teacherId;
        }
        throw new Error("Invalid response from server.");
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    },
    [authData.accessToken]
  );

  const handleSelectType = useCallback(
    async (event, type) => {
      event.preventDefault();
      setError(null);

      const studentId = !isParent() ? userId : bookingData.childId;
      if (!studentId) {
        setError(
          "No valid student ID available. Please go back and select a child."
        );
        swalWithConfig.fire({
          title: "Missing Selection",
          text: "No valid student ID available. Please go back and select a child.",
          icon: "warning",
        });
        return;
      }

      updateBookingData({
        consultantType: type,
        isHomeroomTeacher: type === "homeroom",
      });

      if (type === "homeroom") {
        const teacherId = await fetchHomeroomTeacher(studentId);
        if (teacherId) {
          updateBookingData({ consultantId: teacherId, consultantName: "" });
        }
      } else {
        updateBookingData({ consultantId: "", consultantName: "" });
      }
    },
    [
      isParent,
      userId,
      bookingData.childId,
      updateBookingData,
      fetchHomeroomTeacher,
    ]
  );

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#666" }}>
          Loading...
        </Typography>
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
        Select Consultant Type
      </Typography>
      {error ? (
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          {error}
        </Typography>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          {["counselor", "homeroom"].map((type) => (
            <Card
              key={type}
              component={motion.div}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                width: 200,
                borderRadius: "8px",
                border:
                  bookingData.consultantType === type
                    ? "2px solid #26A69A"
                    : "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#26A69A",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
              onClick={(e) => handleSelectType(e, type)}
            >
              <CardContent sx={{ p: 2, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color:
                      bookingData.consultantType === type ? "#26A69A" : "#333",
                  }}
                >
                  {type === "counselor" ? "Counselor" : "Homeroom Teacher"}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};
