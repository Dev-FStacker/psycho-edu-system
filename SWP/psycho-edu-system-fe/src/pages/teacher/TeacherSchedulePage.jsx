/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Modal,
  Fade,
  Button,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import moment from "moment";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FeedbackForm from "../../components/Modal/FeedbackForm";

const TeacherSchedulePage = () => {
  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedEventToCancel, setSelectedEventToCancel] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const authData = getAuthDataFromLocalStorage();
  const teacherId = authData?.userId;
  const navigate = useNavigate();

  const daysInMonth = () => {
    const days = [];
    const startOfMonth = moment(currentMonth).startOf("month");
    const endOfMonth = moment(currentMonth).endOf("month");
    const totalDays = endOfMonth.date();
    const firstDayOfWeek = startOfMonth.day();
    const totalSlots = 42;

    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 0; i < totalDays; i++) {
      const date = startOfMonth.clone().add(i, "days").toDate();
      days.push({
        day: moment(date).date(),
        weekday: ["S", "M", "T", "W", "T", "F", "S"][moment(date).day()],
        fullDate: date,
      });
    }
    const remainingSlots = totalSlots - days.length;
    for (let i = 0; i < remainingSlots; i++) days.push(null);

    return days;
  };

  const days = daysInMonth();
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  useEffect(() => {
    if (!teacherId) {
      setError("User ID not found in token. Please log in again.");
      setIsLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        const profileResponse = await axios.get(
          `https://localhost:7192/api/User/profile?userId=${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (profileResponse.status === 200 && profileResponse.data.isSuccess) {
          setUserProfile(profileResponse.data.result);
        }

        await Promise.all([
          fetchAppointments(selectedDate),
          fetchSchedules(selectedDate),
        ]);
      } catch (error) {
        setBookings([]);
        setAvailableSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [teacherId, authData?.accessToken]);

  const fetchAppointments = async (date) => {
    try {
      const selectedDateStr = moment(date).format("YYYY-MM-DD");
      const appointmentResponse = await axios.get(
        `https://localhost:7192/api/appointments/consultants/${teacherId}/appointments?selectedDate=${selectedDateStr}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let appointments = [];
      if (
        appointmentResponse.status === 200 &&
        appointmentResponse.data.isSuccess
      ) {
        appointments = appointmentResponse.data.result || [];
        if (!Array.isArray(appointments)) {
          setBookings([]);
        } else {
          const bookedSlots = appointments.map((appointment) => {
            const startDateTime = moment(
              `${moment(appointment.date, "DD/MM/YYYY").format(
                "YYYY-MM-DD"
              )} ${getTimeFromSlotId(appointment.slotId)}`,
              "YYYY-MM-DD HH:mm"
            ).toDate();
            const endDateTime = moment(startDateTime)
              .add(60, "minutes")
              .toDate();

            let title = `Meeting with ${
              appointment.appointmentFor || "Student"
            }`;
            return {
              id: appointment.appointmentId,
              title: `${title} ${appointment.isOnline ? "Online" : "Offline"}`,
              start: startDateTime,
              end: endDateTime,
              details: {
                studentId: appointment.appointmentFor || "Unknown",
                consultantId: appointment.meetingWith || teacherId,
                bookedBy: appointment.bookedBy || "Unknown",
                notes: appointment.notes,
                appointmentFor: appointment.appointmentFor || "Unknown",
                date: moment(appointment.date, "DD/MM/YYYY").format(
                  "YYYY-MM-DD"
                ),
                slotId: appointment.slotId,
                meetingType: appointment.isOnline ? "Online" : "Offline",
                isCompleted: appointment.isCompleted,
                isCancelled: appointment.isCancelled,
              },
            };
          });
          setBookings(bookedSlots);
        }
      } else {
        setBookings([]);
      }
    } catch (error) {
      setBookings([]);
    }
  };

  const fetchSchedules = async (date) => {
    try {
      const selectedDateStr = moment(date).format("YYYY-MM-DD");
      const scheduleResponse = await axios.get(
        `https://localhost:7192/api/Schedule/user-schedules/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (scheduleResponse.status === 200) {
        const schedules = scheduleResponse.data || [];
        if (!Array.isArray(schedules)) {
          setAvailableSlots([]);
        } else {
          const available = schedules
            .filter((schedule) =>
              moment(schedule.date).isSame(selectedDateStr, "day")
            )
            .map((schedule) => ({
              id: schedule.scheduleId,
              title: `Available Slot`,
              start: moment(schedule.date)
                .set({
                  hour: parseInt(schedule.slotName.split(":")[0], 10),
                  minute: 0,
                })
                .toDate(),
              end: moment(schedule.date)
                .set({
                  hour: parseInt(schedule.slotName.split(":")[0], 10) + 1,
                  minute: 0,
                })
                .toDate(),
              details: {
                slotId: schedule.slotId,
                date: moment(schedule.date).format("YYYY-MM-DD"),
                slotName: schedule.slotName,
                createAt: schedule.createAt,
              },
            }));
          setAvailableSlots(available);
        }
      } else {
        setAvailableSlots([]);
      }
    } catch (error) {
      setAvailableSlots([]);
    }
  };

  useEffect(() => {
    if (!teacherId || !authData?.accessToken) return;
    Promise.all([
      fetchAppointments(selectedDate),
      fetchSchedules(selectedDate),
    ]);
  }, [selectedDate, teacherId, authData?.accessToken]);

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

  const handleSelectEvent = (event) => setSelectedEvent(event);
  const handleJoinChat = (id) => navigate(`/chat/${id}`);
  const closeModal = () => setSelectedEvent(null);

  const handleCancelAppointment = async () => {
    if (!selectedEvent) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://localhost:7192/api/appointments/${selectedEvent.id}/cancellation`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.isSuccess) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === selectedEvent.id
              ? {
                  ...booking,
                  details: { ...booking.details, isCancelled: true },
                }
              : booking
          )
        );
        setSelectedEvent((prev) => ({
          ...prev,
          details: { ...prev.details, isCancelled: true },
        }));
        setIsConfirmModalOpen(false);
        setSelectedEventToCancel(null);
        setSelectedEvent(null);
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      // No toast notification here as per original code
    } finally {
      setIsLoading(false);
    }
  };

  const openConfirmModal = (event) => {
    setSelectedEventToCancel(event);
    setIsConfirmModalOpen(true);
  };

  const confirmCancelAppointment = () => handleCancelAppointment();
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedEventToCancel(null);
  };
  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const handleDayClick = (fullDate) => setSelectedDate(fullDate);
  const handleNextMonth = () =>
    setCurrentMonth(moment(currentMonth).add(1, "month"));
  const handlePrevMonth = () =>
    setCurrentMonth(moment(currentMonth).subtract(1, "month"));

  const filteredBookings = bookings.filter((booking) =>
    moment(booking.start).isSame(selectedDate, "day")
  );
  const filteredAvailableSlots = availableSlots.filter((slot) =>
    moment(slot.start).isSame(selectedDate, "day")
  );

  const getStatus = (event) => {
    const { isCompleted, isCancelled } = event.details;
    if (isCancelled) return "Cancelled";
    if (isCompleted) return "Completed";
    return "Booked";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress size={40} sx={{ color: "#3b82f6" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <Typography variant="h6">{error}</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-900 flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8"
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textAlign: "center",
            background: "linear-gradient(to right, #1e88e5, #8e24aa)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Teacher Schedule
        </Typography>
        {userProfile && (
          <Typography
            variant="body1"
            sx={{
              fontFamily: "Inter, sans-serif",
              fontSize: "1rem",
              color: "#555",
              textAlign: "center",
              mt: 1,
            }}
          >
            Welcome, {userProfile.fullName || "Teacher"}
          </Typography>
        )}
      </motion.div>

      {/* Calendar Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="bg-orange-100 p-6 rounded-2xl shadow-xl mb-8"
      >
        <Box className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <Button
            onClick={handlePrevMonth}
            variant="contained"
            className="bg-blue-500 text-white hover:bg-blue-600"
            sx={{ textTransform: "none", fontFamily: "Inter, sans-serif" }}
          >
            Back
          </Button>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: "#333",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {moment(currentMonth).format("MMMM YYYY")}
          </Typography>
          <Button
            onClick={handleNextMonth}
            variant="contained"
            className="bg-blue-500 text-white hover:bg-blue-600"
            sx={{ textTransform: "none", fontFamily: "Inter, sans-serif" }}
          >
            Next
          </Button>
        </Box>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "1rem",
            color: "#555",
            textAlign: "center",
            mb: 4,
          }}
        >
          Selected: {moment(selectedDate).format("dddd, DD/MM/YYYY")}
        </Typography>
        <div className="grid grid-cols-7 gap-2">
          {weekdays.map((weekday, index) => (
            <Typography
              key={`weekday-${index}`}
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                color: "#666",
                textAlign: "center",
              }}
            >
              {weekday}
            </Typography>
          ))}
          {days.map((d, index) =>
            d ? (
              <motion.button
                key={`${currentMonth.format("YYYY-MM")}-${index}`}
                className={`w-full h-12 flex items-center justify-center rounded-xl font-medium transition-all duration-300 shadow-md ${
                  moment(d.fullDate).isSame(selectedDate, "day")
                    ? "bg-green-500 text-white"
                    : "bg-blue-200 hover:bg-blue-300"
                }`}
                onClick={() => handleDayClick(d.fullDate)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Typography
                  sx={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                >
                  {d.day}
                </Typography>
              </motion.button>
            ) : (
              <div
                key={`${currentMonth.format("YYYY-MM")}-${index}`}
                className="w-full h-12 bg-gray-100 rounded-xl"
              />
            )
          )}
        </div>
      </motion.div>

      {/* Schedule Section */}
      <Box className="mt-8">
        {/* Booked Appointments */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#333",
            mb: 4,
            textAlign: "center",
          }}
        >
          Booked Appointments
        </Typography>
        {filteredBookings.length > 0 ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {filteredBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-xl shadow-lg bg-orange-50 border border-orange-200">
                    <CardContent className="p-4 sm:p-5">
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          fontWeight: 600,
                          color: "#333",
                          mb: 1,
                          fontSize: { xs: "1rem", sm: "1.125rem" },
                        }}
                      >
                        {booking.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          color: "#666",
                          mb: 1,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        Student ID: {booking.details.studentId}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "Roboto, sans-serif",
                          color: "#444",
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        <Clock className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-gray-700" />
                        {moment(booking.start).format("HH:mm")} -{" "}
                        {moment(booking.end).format("HH:mm")}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: "Roboto, sans-serif",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            fontWeight: 500,
                            color: "#fff",
                            backgroundColor: "#4caf50",
                            px: 2,
                            py: 0.5,
                            borderRadius: "12px",
                          }}
                        >
                          {booking.details.meetingType}
                        </Typography>
                        <Typography
                          component="span"
                          sx={{
                            fontFamily: "Roboto, sans-serif",
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
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
                          mt: 3,
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 1,
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              fontFamily: "Roboto, sans-serif",
                              color: "#1e88e5",
                              borderColor: "#1e88e5",
                              "&:hover": {
                                backgroundColor: "#e3f2fd",
                                borderColor: "#1e88e5",
                              },
                              textTransform: "none",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                            disabled={booking.details.isCancelled}
                            onClick={() => handleJoinChat(booking.id)}
                          >
                            Join
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              fontFamily: "Roboto, sans-serif",
                              color: "#f57c00",
                              borderColor: "#f57c00",
                              "&:hover": {
                                backgroundColor: "#fff3e0",
                                borderColor: "#f57c00",
                              },
                              textTransform: "none",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                            onClick={() => handleSelectEvent(booking)}
                          >
                            Details
                          </Button>
                        </motion.div>
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
              mb: 8,
            }}
          >
            No booked appointments for this date
          </Typography>
        )}

        {/* Available Slots */}
        <Typography
          variant="h5"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            color: "#333",
            mb: 4,
            textAlign: "center",
          }}
        >
          Available Slots
        </Typography>
        {filteredAvailableSlots.length > 0 ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredAvailableSlots.map((slot) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <Card className="rounded-xl shadow-lg bg-blue-50 border border-blue-200">
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
                        {slot.title}
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
                        {moment(slot.start).format("HH:mm")} -{" "}
                        {moment(slot.end).format("HH:mm")}
                      </Typography>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSelectEvent(slot)}
                          sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "0.9rem",
                            color: "#f57c00",
                            borderColor: "#f57c00",
                            "&:hover": {
                              backgroundColor: "#fff3e0",
                              borderColor: "#f57c00",
                            },
                            textTransform: "none",
                            px: 2,
                          }}
                        >
                          Details
                        </Button>
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
            No available slots for this date
          </Typography>
        )}
      </Box>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog
          open={Boolean(selectedEvent)}
          onClose={closeModal}
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: "16px",
              width: { xs: "90%", sm: 550 },
              maxWidth: 550,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              p: 3,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "#333",
              pb: 2,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            {selectedEvent.title}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(selectedEvent.details.studentId
                ? [
                    {
                      label: "Date",
                      value: moment(selectedEvent.details.date).format(
                        "YYYY-MM-DD"
                      ),
                    },
                    {
                      label: "Time",
                      value: getTimeFromSlotId(selectedEvent.details.slotId),
                    },
                    {
                      label: "Student ID",
                      value: selectedEvent.details.studentId,
                    },
                    {
                      label: "Consultant",
                      value: selectedEvent.details.consultantId,
                    },
                    {
                      label: "Booked By",
                      value: selectedEvent.details.bookedBy || "Unknown",
                    },
                    {
                      label: "Meeting Type",
                      value: selectedEvent.details.meetingType,
                    },
                    { label: "Status", value: getStatus(selectedEvent) },
                  ]
                : [
                    {
                      label: "Date",
                      value: moment(selectedEvent.details.date).format(
                        "YYYY-MM-DD"
                      ),
                    },
                    { label: "Time", value: selectedEvent.details.slotName },
                    {
                      label: "Created At",
                      value: moment(selectedEvent.details.createAt).format(
                        "YYYY-MM-DD HH:mm:ss"
                      ),
                    },
                  ]
              ).map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "1rem",
                      color: "#555",
                    }}
                  >
                    {item.label}:
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "1rem",
                      color: "#333",
                      fontWeight: 400,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <FeedbackForm appointment={selectedEvent} role={authData.role} />
          </DialogContent>
          <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
            {!selectedEvent.details.isCancelled && (
              <Button
                onClick={() => openConfirmModal(selectedEvent)}
                variant="contained"
                color="error"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.95rem",
                  textTransform: "none",
                  px: 4,
                  py: 1,
                  minWidth: 120,
                }}
              >
                Cancel Appointment
              </Button>
            )}
            <Button
              onClick={closeModal}
              variant="outlined"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.95rem",
                color: "#555",
                borderColor: "#555",
                "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#333" },
                textTransform: "none",
                px: 4,
                py: 1,
                minWidth: 120,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirm Cancellation Modal */}
      <Modal
        open={isConfirmModalOpen}
        onClose={closeConfirmModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Fade in={isConfirmModalOpen}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              p: 4,
              width: { xs: "90%", sm: 450 },
              maxWidth: 450,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "#333",
                mb: 2,
                textAlign: "center",
              }}
            >
              Confirm Cancellation
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1rem",
                color: "#666",
                mb: 3,
                textAlign: "center",
              }}
            >
              Are you sure you want to cancel this appointment on{" "}
              {moment(selectedEventToCancel?.details?.date).format(
                "YYYY-MM-DD"
              )}{" "}
              at {getTimeFromSlotId(selectedEventToCancel?.details?.slotId)}?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                onClick={confirmCancelAppointment}
                variant="contained"
                color="error"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.95rem",
                  textTransform: "none",
                  px: 3,
                  py: 1,
                }}
              >
                Yes
              </Button>
              <Button
                onClick={closeConfirmModal}
                variant="outlined"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "0.95rem",
                  color: "#666",
                  borderColor: "#666",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#444",
                  },
                  textTransform: "none",
                  px: 3,
                  py: 1,
                }}
              >
                No
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={isSuccessModalOpen}
        onClose={closeSuccessModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Fade in={isSuccessModalOpen}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              p: 4,
              width: { xs: "90%", sm: 400 },
              maxWidth: 400,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.5rem",
                color: "#4caf50",
                mb: 2,
              }}
            >
              Success!
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1rem",
                color: "#333",
                mb: 3,
              }}
            >
              Appointment cancelled successfully!
            </Typography>
            <Button
              onClick={closeSuccessModal}
              variant="contained"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.95rem",
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#388e3c" },
                textTransform: "none",
                px: 4,
                py: 1,
              }}
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default TeacherSchedulePage;
