import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, Typography, Box, Button } from "@mui/material";
import { Clock } from "lucide-react";
import { format, isSameDay } from "date-fns";

const ParentAppointmentsList = ({
  isLoading,
  filteredAppointments,
  handleChat,
  selectedDate,
}) => {
  const getTimeFromSlotId = (slotId) => {
    const times = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ];
    return times[slotId - 1] || "Unknown";
  };

  const getStatus = (appointment) => {
    const { isCompleted, isCancelled } = appointment.details;
    if (isCancelled) return "Cancelled";
    if (isCompleted) return "Completed";
    return "Booked";
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography sx={{ fontFamily: "Inter, sans-serif", color: "#666" }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  const filteredBookings = filteredAppointments.filter((booking) =>
    isSameDay(new Date(booking.start), selectedDate)
  );

  return (
    <Box className="mt-8">
      {filteredBookings.length > 0 ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Card
                  className="rounded-xl shadow-lg bg-orange-50 border border-orange-200 hover:shadow-xl transition-shadow duration-300"
                  sx={{ minWidth: 280, maxWidth: 350 }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: "1.25rem",
                        color: "#333",
                        mb: 1.5,
                      }}
                    >
                      {booking.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.95rem",
                        color: "#666",
                        mb: 1,
                      }}
                    >
                      <strong>Student:</strong> {booking.details.studentName}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.95rem",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Clock className="w-5 h-5 mr-2 text-gray-700" />
                      {format(booking.start, "HH:mm")} -{" "}
                      {format(booking.end, "HH:mm")}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color: "#fff",
                          backgroundColor: "#4caf50",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "12px",
                        }}
                      >
                        {booking.details.meetingType}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.9rem",
                          fontWeight: 500,
                          color:
                            getStatus(booking) === "Cancelled"
                              ? "#ef5350"
                              : getStatus(booking) === "Completed"
                              ? "#4caf50"
                              : "#1e88e5",
                        }}
                      >
                        {getStatus(booking)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: { xs: "1.5rem", sm: "2rem" },
            fontWeight: 500,
            color: "#666",
            textAlign: "center",
            mt: 4,
          }}
        >
          No appointments for this date
        </Typography>
      )}
    </Box>
  );
};

export default ParentAppointmentsList;
