import { useState, useEffect, useCallback } from "react";
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

export const ConsultantSelection = () => {
  const { updateBookingData, bookingData, isParent } = useBooking();
  const [consultants, setConsultants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHomeroomTeacher = async (studentId) => {
    const authData = getAuthDataFromLocalStorage();
    try {
      const classResponse = await axios.get(
        `https://localhost:7192/api/User/${studentId}/class`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const teacherId = classResponse.data.result.result.teacherId;
      const className = classResponse.data.result.className || "Unknown Class";

      const profileResponse = await axios.get(
        `https://localhost:7192/api/User/profile?userId=${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const teacherProfile = profileResponse.data.result;
      const age = teacherProfile.birthDay
        ? 2025 - parseInt(teacherProfile.birthDay.split("/")[2], 10)
        : "N/A";

      return [
        {
          id: teacherId,
          name: teacherProfile.fullName || "Unknown Teacher",
          phone: teacherProfile.phone || "N/A",
          email: teacherProfile.email || "N/A",
          birthDay: teacherProfile.birthDay || "N/A",
          age,
          role: "Homeroom Teacher",
          className,
          availableSlots: [],
        },
      ];
    } catch (error) {}
  };

  const fetchCounselors = async () => {
    const authData = getAuthDataFromLocalStorage();
    try {
      const response = await axios.get(
        `https://localhost:7192/api/psychologists`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.result.map((psychologist) => {
        const age = psychologist.birthDay
          ? 2025 - new Date(psychologist.birthDay).getFullYear()
          : "N/A";
        return {
          id: psychologist.userId,
          name:
            psychologist.fullName ||
            `Counselor ${psychologist.userId.slice(0, 8)}`,
          phone: psychologist.phoneNumber || "N/A",
          email: psychologist.email || "N/A",
          birthDay: psychologist.birthDay || "N/A",
          age,
          role: "Counselor",
          availableSlots: [],
        };
      });
    } catch (error) {}
  };

  useEffect(() => {
    const fetchConsultants = async () => {
      setIsLoading(false);
      try {
        if (!bookingData.consultantType) {
          setError("Please select a consultant type first.");
          swalWithConfig.fire({
            title: "Selection Required",
            text: "Please select a consultant type first.",
            icon: "warning",
          });
          return;
        }

        const studentId = !isParent()
          ? bookingData.userId
          : bookingData.childId;
        if (!studentId) {
          setError("No valid student ID available.");
          swalWithConfig.fire({
            title: "Invalid Selection",
            text: "No valid student selected. Please go back and choose a student.",
            icon: "error",
          });
          return;
        }

        const consultantList =
          bookingData.consultantType === "homeroom"
            ? await fetchHomeroomTeacher(studentId)
            : await fetchCounselors();

        setConsultants(consultantList.length ? consultantList : []);
        if (!consultantList.length) {
          setError(
            bookingData.consultantType === "homeroom"
              ? "There are no homeroom teachers available."
              : "There are no counselors available."
          );
        }
      } catch (error) {}
    };

    fetchConsultants();
  }, [
    bookingData.consultantType,
    bookingData.userId,
    bookingData.childId,
    isParent,
  ]);

  const handleSelectConsultant = useCallback(
    (consultant) => {
      updateBookingData({
        consultantId: consultant.id,
        consultantName: consultant.name,
        consultantDetails: {
          phone: consultant.phone,
          email: consultant.email,
          age: consultant.age,
          ...(consultant.className && { className: consultant.className }),
        },
        availableSlots: consultant.availableSlots,
      });
    },
    [updateBookingData]
  );

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#666" }}>
          Loading consultants...
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
        Select Consultant
      </Typography>
      {error ? (
        <Typography sx={{ textAlign: "center", color: "#666" }}>
          {error}
        </Typography>
      ) : (
        <Box
          sx={{
            display: consultants.length <= 3 ? "flex" : "grid", // Flex nếu <= 3, Grid nếu > 3
            flexWrap: "wrap", // Cho phép xuống dòng nếu cần
            gridTemplateColumns:
              consultants.length > 3
                ? "repeat(auto-fill, minmax(200px, 1fr))"
                : undefined, // Auto-fill nếu > 3
            gap: 2,
            justifyContent: "center", // Căn giữa các card
            alignItems: "center",
            maxWidth: "1200px", // Giới hạn chiều rộng tối đa
            mx: "auto", // Căn giữa container
          }}
        >
          {consultants.map((consultant) => (
            <Card
              key={consultant.id}
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                width: 200, // Chiều rộng cố định cho mỗi card
                borderRadius: "8px",
                border:
                  bookingData.consultantId === consultant.id
                    ? "2px solid #26A69A"
                    : "1px solid #e0e0e0",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#26A69A",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => handleSelectConsultant(consultant)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "#26A69A",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      {consultant.name?.charAt(0) || "C"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "#333",
                      }}
                    >
                      {consultant.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.85rem",
                        color: "#666",
                      }}
                    >
                      {consultant.role}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      color: "#666",
                    }}
                  >
                    Phone: {consultant.phone}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.8rem",
                      color: "#666",
                    }}
                  >
                    Email: {consultant.email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};
