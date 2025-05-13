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
import moment from "moment";
import apiService from "../../services/apiService";
import { formatDate } from "../../utils/dateUtils";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trash2, Calendar } from "lucide-react";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import axios from "axios";

const PsychologistScheduleRegistration = () => {
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
  const [targetPrograms, setTargetPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [prevUserId, setPrevUserId] = useState(null); // Lưu userId trước đó để so sánh

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

  // Reset state khi userId thay đổi
  useEffect(() => {
    if (prevUserId && userId && prevUserId !== userId) {
      // Reset tất cả state khi userId thay đổi
      setBookedSlots([]);
      setTargetPrograms([]);
      setSelectedDates({});
      setSelectedDate(new Date());
      setCurrentMonth(moment());
      setIsLoading(false);
      setIsSuccessModalOpen(false);
      setIsErrorModalOpen(false);
      setSuccessMessage("");
      setErrorMessage("");
    }
    setPrevUserId(userId); // Cập nhật prevUserId
  }, [userId, prevUserId]);

  // Fetch booked slots
  useEffect(() => {
    if (!userId || !token) return;

    const fetchBookedSlots = async () => {
      try {
        setIsLoading(true);
        const slots = await apiService.fetchUserSchedules(userId);
        setBookedSlots(
          slots.map((slot) => ({
            bookingId: slot.scheduleId || null,
            slotId: slot.slotId,
            date: formatDate(slot.date),
            time: slot.slotName,
          }))
        );
      } catch (error) {
        toast.error("Failed to load booked slots.");
        setBookedSlots([]); // Reset nếu có lỗi
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookedSlots();
  }, [userId, token]);

  // Fetch Target Programs khi chọn ngày
  useEffect(() => {
    if (!userId || !token || !selectedDate) return;

    const fetchTargetPrograms = async () => {
      try {
        const dateStr = moment(selectedDate).format("YYYY-MM-DD");
        const response = await axios.get(
          `https://localhost:7192/api/TargetProgram/list?day=${dateStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTargetPrograms(response.data || []);
      } catch (error) {
        console.error("Error fetching target programs:", error);
        toast.error("Failed to load target programs.");
        setTargetPrograms([]); // Reset nếu có lỗi
      }
    };
    fetchTargetPrograms();
  }, [selectedDate, userId, token]);

  const handleDayClick = (fullDate) => {
    if (moment(fullDate).isBefore(moment(), "day")) return;
    setSelectedDate(fullDate);
  };

  const handleNextMonth = () =>
    setCurrentMonth(moment(currentMonth).add(1, "month"));
  const handlePrevMonth = () =>
    setCurrentMonth(moment(currentMonth).subtract(1, "month"));

  const handleSlotToggle = (dateKey, slotId) => {
    const slotTime = timeSlots.find((slot) => slot.id === slotId).time;
    const slotDateTime = `${dateKey}T${slotTime}:00`;

    const isAssignedToTargetProgram = targetPrograms.some(
      (program) =>
        program.counselor.userId === userId &&
        program.startDate === slotDateTime
    );

    if (isAssignedToTargetProgram) {
      toast.error(
        `Slot ${slotTime} on ${dateKey} is assigned to a Target Program and cannot be registered.`
      );
      return;
    }

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
      ([date, slots]) => slots.map((slotId) => ({ slotId, date }))
    );

    if (bookingDetails.length === 0) {
      setErrorMessage("Please select at least one date and slot.");
      setIsErrorModalOpen(true);
      return;
    }

    const duplicateBookings = bookingDetails.filter((booking) =>
      bookedSlots.some(
        (b) => b.slotId === booking.slotId && b.date === booking.date
      )
    );

    if (duplicateBookings.length > 0) {
      setErrorMessage("Duplicate slots detected.");
      setIsErrorModalOpen(true);
      return;
    }

    for (const booking of bookingDetails) {
      const slotTime = timeSlots.find(
        (slot) => slot.id === booking.slotId
      ).time;
      const slotDateTime = `${booking.date}T${slotTime}:00`;
      const isAssigned = targetPrograms.some(
        (program) =>
          program.counselor.userId === userId &&
          program.startDate === slotDateTime
      );
      if (isAssigned) {
        setErrorMessage(
          `Slot ${slotTime} on ${booking.date} is assigned to a Target Program.`
        );
        setIsErrorModalOpen(true);
        return;
      }
    }

    const payload = { userId, bookingDetails };
    try {
      setIsLoading(true);
      const response = await apiService.bookSlots(payload);
      setBookedSlots((prev) => [
        ...prev,
        ...bookingDetails.map((b) => ({
          slotId: b.slotId,
          date: b.date,
          time: timeSlots.find((t) => t.id === b.slotId)?.time,
        })),
      ]);
      setSuccessMessage(response.message || "Slots booked successfully!");
      setIsSuccessModalOpen(true);
      setSelectedDates({});
    } catch (error) {
      setErrorMessage(error.message || "Failed to book slots.");
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

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
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textAlign: "center",
          }}
        >
          Register Your Available Slots
        </Typography>
      </motion.div>

      <Box className="flex flex-col lg:flex-row gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl flex-1 flex flex-col"
        >
          <Box className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
            <Button onClick={handlePrevMonth} variant="contained">
              Back
            </Button>
            <Typography variant="h5">
              {moment(currentMonth).format("MMMM YYYY")}
            </Typography>
            <Button onClick={handleNextMonth} variant="contained">
              Next
            </Button>
          </Box>
          <Typography sx={{ textAlign: "center", mb: 4 }}>
            Selected: {moment(selectedDate).format("dddd, DD/MM/YYYY")}
          </Typography>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekdays.map((weekday, index) => (
              <Typography key={`weekday-${index}`} sx={{ textAlign: "center" }}>
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
                      : "bg-blue-200 hover:bg-blue-300"
                  }`}
                  onClick={() => handleDayClick(d.fullDate)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={moment(d.fullDate).isBefore(moment(), "day")}
                >
                  <Typography>{d.day}</Typography>
                </motion.button>
              ) : (
                <div
                  key={`${currentMonth.format("YYYY-MM")}-${index}`}
                  className="w-full h-10 sm:h-12 bg-gray-100 rounded-xl"
                />
              )
            )}
          </motion.div>

          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
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

          <Typography variant="h5" sx={{ textAlign: "center", mb: 3 }}>
            Selected Slots
          </Typography>
          <AnimatePresence>
            {Object.keys(selectedDates).length === 0 ? (
              <Typography sx={{ textAlign: "center", fontStyle: "italic" }}>
                No slots selected yet.
              </Typography>
            ) : (
              Object.entries(selectedDates).map(([date, slots]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-3 p-3 bg-blue-50 rounded-lg flex justify-between items-center"
                >
                  <Box>
                    <Typography>
                      {new Date(date).toLocaleDateString("en-GB")}
                    </Typography>
                    <Typography>
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
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || Object.keys(selectedDates).length === 0}
        >
          {isLoading ? "Submitting..." : "Submit Schedule"}
        </Button>
      </motion.div>

      <Modal
        open={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      >
        <Fade in={isSuccessModalOpen}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              p: 4,
              width: { xs: "90%", sm: 400 },
              margin: "auto",
              top: "50%",
              position: "relative",
              transform: "translateY(-50%)",
            }}
          >
            <Typography variant="h5" sx={{ color: "#4caf50", mb: 2 }}>
              Success!
            </Typography>
            <Typography>{successMessage}</Typography>
            <Button
              onClick={() => setIsSuccessModalOpen(false)}
              variant="contained"
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>

      <Modal open={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)}>
        <Fade in={isErrorModalOpen}>
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: "16px",
              p: 4,
              width: { xs: "90%", sm: 400 },
              margin: "auto",
              top: "50%",
              position: "relative",
              transform: "translateY(-50%)",
            }}
          >
            <Typography variant="h5" sx={{ color: "#ef5350", mb: 2 }}>
              Error
            </Typography>
            <Typography>{errorMessage}</Typography>
            <Button
              onClick={() => setIsErrorModalOpen(false)}
              variant="contained"
            >
              Close
            </Button>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
};

export default PsychologistScheduleRegistration;
