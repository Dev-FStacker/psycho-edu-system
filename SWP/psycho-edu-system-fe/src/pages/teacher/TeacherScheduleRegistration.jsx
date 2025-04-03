/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Modal,
  Fade,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";
import moment from "moment";

const TeacherScheduleRegistration = () => {
  const authData = getAuthDataFromLocalStorage();
  const userId = authData?.userId;
  const token = authData?.accessToken;

  const timeSlots = [
    { id: 1, time: "08:00" },
    { id: 2, time: "09:00" },
    { id: 3, time: "10:00" },
    { id: 4, time: "11:00" },
    { id: 5, time: "13:00" },
    { id: 6, time: "14:00" },
    { id: 7, time: "15:00" },
    { id: 8, time: "16:00" },
  ];

  const [currentMonth, setCurrentMonth] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState({});
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState(null);

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
    if (!userId || !token) return;

    const fetchProfileAndBookedSlots = async () => {
      try {
        setIsLoading(true);

        const profileResponse = await axios.get(
          `https://localhost:7192/api/User/profile?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (profileResponse.status === 200 && profileResponse.data.isSuccess) {
          setUserProfile(profileResponse.data.result);
        }
      } catch (error) {
        toast.error("Failed to load profile data.", { position: "top-right" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndBookedSlots();
  }, [userId, token]);

  const handleDayClick = (fullDate) => {
    if (moment(fullDate).isBefore(moment(), "day")) return;
    setSelectedDate(fullDate);
  };

  const handleNextMonth = () =>
    setCurrentMonth(moment(currentMonth).add(1, "month"));
  const handlePrevMonth = () =>
    setCurrentMonth(moment(currentMonth).subtract(1, "month"));

  const handleSlotToggle = (dateKey, slotId) => {
    setSelectedDates((prev) => {
      const currentSlots = prev[dateKey] || [];
      return {
        ...prev,
        [dateKey]: currentSlots.includes(slotId)
          ? currentSlots.filter((id) => id !== slotId)
          : [...currentSlots, slotId],
      };
    });
  };

  const handleRemoveDate = (dateKey) => {
    setSelectedDates((prev) => {
      const newDates = { ...prev };
      delete newDates[dateKey];
      return newDates;
    });
  };

  const handleSubmit = async () => {
    const bookingDetails = Object.entries(selectedDates).flatMap(
      ([date, slots]) =>
        slots.map((slotId) => ({
          slotId,
          date,
        }))
    );

    if (bookingDetails.length === 0) {
      setErrorMessage("Please select at least one date and slot.");
      setIsErrorModalOpen(true);
      return;
    }

    const duplicateBookings = bookingDetails.filter((booking) =>
      bookedSlots.some(
        (booked) =>
          booked.slotId === booking.slotId && booked.date === booking.date
      )
    );

    if (duplicateBookings.length > 0) {
      const duplicateMsg = duplicateBookings
        .map(
          (booking) =>
            `Slot ${
              timeSlots.find((slot) => slot.id === booking.slotId)?.time
            } on ${new Date(booking.date).toLocaleDateString("en-GB")}`
        )
        .join(", ");
      setErrorMessage(`Duplicates found: ${duplicateMsg}`);
      setIsErrorModalOpen(true);
      return;
    }

    const payload = { userId, bookingDetails };

    try {
      setIsLoading(true);
      const response = await axios.post(
        "https://localhost:7192/api/Schedule/book-slots",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 && response.data) {
        const booked = response.data.bookings
          ? response.data.bookings.map((booking) => ({
              bookingId: booking.bookingId,
              slotId: booking.slotId,
              date: booking.date.split("T")[0],
              time: timeSlots.find((slot) => slot.id === booking.slotId)?.time,
            }))
          : [];
        setBookedSlots((prev) => [...prev, ...booked]);
        setSuccessMessage(
          response.data.message || "Slots booked successfully!"
        );
        setIsSuccessModalOpen(true);
        setSelectedDates({});
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      setErrorMessage(error.response.data);
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeSuccessModal = () => setIsSuccessModalOpen(false);
  const closeErrorModal = () => setIsErrorModalOpen(false);

  const formatDateKey = (date) => moment(date).format("YYYY-MM-DD");

  if (!userId || !token) {
    return (
      <div className="p-6 bg-white min-h-screen flex items-center justify-center">
        <Typography variant="h6" className="text-red-600 text-center">
          User authentication required. Please log in.
        </Typography>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <CircularProgress size={40} sx={{ color: "#3b82f6" }} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen text-gray-900 flex flex-col max-w-7xl mx-auto">
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
          Register Your Available Slots
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

      {/* Main Content */}
      <Box className="flex flex-col lg:flex-row gap-6">
        {/* Calendar and Slots */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl flex-1 flex flex-col"
        >
          <Box className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
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
          <div className="grid grid-cols-7 gap-2 mb-4">
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
          </div>
          <motion.div
            className="grid grid-cols-7 gap-2 mb-6"
            key={currentMonth.format("YYYY-MM")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {days.map((d, index) =>
              d ? (
                <motion.button
                  key={`${currentMonth.format("YYYY-MM")}-${index}`}
                  className={`w-full h-10 sm:h-12 flex items-center justify-center rounded-xl font-medium transition-all duration-300 shadow-md ${
                    moment(d.fullDate).isSame(selectedDate, "day")
                      ? "bg-green-500 text-white"
                      : moment(d.fullDate).isBefore(moment(), "day")
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : selectedDates[formatDateKey(d.fullDate)]?.length > 0
                      ? "bg-blue-300 text-white hover:bg-blue-400"
                      : "bg-blue-200 hover:bg-blue-300"
                  }`}
                  onClick={() => handleDayClick(d.fullDate)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={moment(d.fullDate).isBefore(moment(), "day")}
                >
                  <Typography
                    sx={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                  >
                    {d.day}
                    {selectedDates[formatDateKey(d.fullDate)]?.length > 0 && (
                      <span className="ml-1 text-xs">
                        ({selectedDates[formatDateKey(d.fullDate)].length})
                      </span>
                    )}
                  </Typography>
                </motion.button>
              ) : (
                <div
                  key={`${currentMonth.format("YYYY-MM")}-${index}`}
                  className="w-full h-10 sm:h-12 bg-gray-100 rounded-xl"
                />
              )
            )}
          </motion.div>

          {/* Time Slots */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#333",
              mb: 2,
              textAlign: "center",
            }}
          >
            Available Slots
          </Typography>
          <div className="grid grid-cols-4 gap-2 mb-6">
            {timeSlots.map((slot) => {
              const dateKey = formatDateKey(selectedDate);
              const isSelected = selectedDates[dateKey]?.includes(slot.id);
              const isBooked = bookedSlots.some(
                (b) => b.date === dateKey && b.slotId === slot.id
              );
              return (
                <motion.button
                  key={slot.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    isBooked
                      ? "bg-green-100 text-gray-500 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 hover:bg-blue-100"
                  }`}
                  onClick={() =>
                    !isBooked && handleSlotToggle(dateKey, slot.id)
                  }
                  disabled={isBooked}
                >
                  {slot.time}
                </motion.button>
              );
            })}
          </div>

          {/* Selected Slots */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#333",
              mb: 3,
              textAlign: "center",
            }}
          >
            Selected Slots
          </Typography>
          <AnimatePresence>
            {Object.keys(selectedDates).length === 0 ? (
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1rem",
                  color: "#666",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                No slots selected yet.
              </Typography>
            ) : (
              Object.entries(selectedDates).map(([date, slots]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center"
                >
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {new Date(date).toLocaleDateString("en-GB")}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "0.9rem",
                        color: "#666",
                      }}
                    >
                      {slots
                        .map(
                          (slotId) =>
                            timeSlots.find((s) => s.id === slotId)?.time
                        )
                        .join(", ")}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => handleRemoveDate(date)}
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ textTransform: "none" }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Booked Slots */}
        {bookedSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1"
          >
            <Card className="rounded-2xl shadow-xl bg-white">
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    color: "#333",
                    mb: 3,
                    textAlign: "center",
                  }}
                >
                  Booked Slots
                </Typography>
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {bookedSlots.map((slot) => (
                    <div
                      key={slot.bookingId}
                      className="p-3 bg-green-50 rounded-lg flex items-center justify-between"
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 500,
                            color: "#333",
                          }}
                        >
                          {new Date(slot.date).toLocaleDateString("en-GB")}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: "0.9rem",
                            color: "#666",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          {slot.time}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "0.9rem",
                          color: "#666",
                        }}
                      >
                        ID: {slot.bookingId}
                      </Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </Box>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || Object.keys(selectedDates).length === 0}
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "1rem",
            backgroundColor: "#1e88e5",
            "&:hover": { backgroundColor: "#1565c0" },
            textTransform: "none",
            px: 6,
            py: 2,
            borderRadius: "12px",
          }}
        >
          {isLoading ? "Submitting..." : "Submit Schedule"}
        </Button>
      </motion.div>

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
              {successMessage}
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

      {/* Error Modal */}
      <Modal
        open={isErrorModalOpen}
        onClose={closeErrorModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Fade in={isErrorModalOpen}>
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
                color: "#ef5350",
                mb: 2,
              }}
            >
              Error
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "1rem",
                color: "#333",
                mb: 3,
              }}
            >
              {errorMessage}
            </Typography>
            <Button
              onClick={closeErrorModal}
              variant="contained"
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.95rem",
                backgroundColor: "#ef5350",
                "&:hover": { backgroundColor: "#d32f2f" },
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

export default TeacherScheduleRegistration;
