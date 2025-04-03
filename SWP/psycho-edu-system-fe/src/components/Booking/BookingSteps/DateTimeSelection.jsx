import { useState, useEffect, useCallback } from "react";
import { useBooking } from "../../../context/BookingContext";
import { getAuthDataFromLocalStorage } from "../../../utils/auth";
import { motion } from "framer-motion";
import apiService from "../../../services/apiService";
import { format, isBefore, startOfDay, startOfMonth } from "date-fns";
import { Box, Typography, Button } from "@mui/material";
import Swal from "sweetalert2";
import axios from "axios";

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

export const DateTimeSelection = () => {
  const { updateBookingData, bookingData } = useBooking();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [slots] = useState([
    { id: 1, time: "8:00" },
    { id: 2, time: "9:00" },
    { id: 3, time: "10:00" },
    { id: 4, time: "11:00" },
    { id: 5, time: "13:00" },
    { id: 6, time: "14:00" },
    { id: 7, time: "15:00" },
    { id: 8, time: "16:00" },
  ]);
  const [availableSlotsCache, setAvailableSlotsCache] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentType, setAppointmentType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSlots, setHasSlots] = useState(true);

  const fetchAvailableSlots = useCallback(
    async (date, consultantId) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const authData = getAuthDataFromLocalStorage();
      const today = startOfDay(new Date());

      if (isBefore(date, today)) {
        setAvailableSlots([]);
        setHasSlots(false);
        setError("Cannot select slots for past dates.");
        return [];
      }

      if (availableSlotsCache[dateKey]) {
        const cachedAvailableSlots = availableSlotsCache[dateKey];
        setAvailableSlots(cachedAvailableSlots);
        setHasSlots(cachedAvailableSlots.length > 0);
        if (cachedAvailableSlots.length === 0) {
          swalWithConfig.fire({
            title: "No Schedules",
            text: "No available slots for this date.",
            icon: "info",
          });
        }
        return cachedAvailableSlots;
      }

      setIsLoading(true);
      try {
        const registeredSlotsData = await apiService.fetchUserSchedules(
          consultantId
        );
        const availableSlotsData = registeredSlotsData
          .filter(
            (schedule) =>
              format(new Date(schedule.date), "yyyy-MM-dd") === dateKey
          )
          .map((schedule) => schedule.slotId)
          .filter((id) => id >= 1 && id <= 8);

        const bookedSlotsData = await apiService.fetchConsultantAppointments(
          consultantId,
          dateKey
        );
        const bookedSlotIds = bookedSlotsData
          .filter((booking) => booking.isCancelled === false)
          .map((booking) => booking.slotId);

        const targetResponse = await axios.get(
          `https://localhost:7192/api/TargetProgram/list?day=${dateKey}`,
          {
            headers: { Authorization: `Bearer ${authData.accessToken}` },
          }
        );
        const targetProgramsData = (targetResponse.data || [])
          .filter((program) => program.counselor.userId === consultantId)
          .map((program) => {
            const slotTime = program.time.split(":")[0] + ":00";
            return slots.find((s) => s.time === slotTime)?.id;
          })
          .filter((id) => id);

        const finalAvailableSlots = availableSlotsData.filter(
          (slotId) =>
            !bookedSlotIds.includes(slotId) &&
            !targetProgramsData.includes(slotId)
        );

        setAvailableSlotsCache((prev) => ({
          ...prev,
          [dateKey]: finalAvailableSlots,
        }));
        setAvailableSlots(finalAvailableSlots);
        setHasSlots(finalAvailableSlots.length > 0);

        if (finalAvailableSlots.length === 0) {
          swalWithConfig.fire({
            title: "No Schedules",
            text: "No available slots for this date.",
            icon: "info",
          });
        }
        return finalAvailableSlots;
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
        setHasSlots(false);
        setError("Failed to fetch available slots.");
        swalWithConfig.fire({
          title: "Error",
          text: "Failed to fetch available slots. Please try again.",
          icon: "error",
        });
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [availableSlotsCache, slots]
  );

  useEffect(() => {
    if (bookingData.consultantId && selectedDate) {
      fetchAvailableSlots(selectedDate, bookingData.consultantId).then(() => {
        if (
          bookingData.slotId &&
          !availableSlots.includes(bookingData.slotId)
        ) {
          updateBookingData({ time: null, slotId: null });
          setAppointmentType(null);
        }
      });
    }
  }, [bookingData.consultantId, selectedDate, fetchAvailableSlots]);

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();

    const weeks = [];
    let currentWeek = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(new Date(year, month, day));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const weeks = getDaysInMonth();
  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  const handleDayClick = async (fullDate) => {
    const today = startOfDay(new Date());
    if (isBefore(fullDate, today)) return;

    setSelectedDate(fullDate);
    const dateStr = format(fullDate, "yyyy-MM-dd");
    updateBookingData({
      date: dateStr,
      time: null,
      slotId: null,
      appointmentType: null,
    });
    setAppointmentType(null);

    if (bookingData.consultantId) {
      await fetchAvailableSlots(fullDate, bookingData.consultantId);
    }
  };

  const handleNextMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  const handlePrevMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );

  const handleSelectSlot = (slot) => {
    if (availableSlots.includes(slot.id)) {
      updateBookingData({
        time: slot.time,
        slotId: slot.id,
      });
    }
  };

  const handleSelectAppointmentType = (type) => {
    setAppointmentType(type);
    updateBookingData({ appointmentType: type });
  };

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
        Select Date, Time, and Appointment Type
      </Typography>
      {error && (
        <Typography sx={{ textAlign: "center", color: "#666", mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box
        sx={{
          bgcolor: "white",
          p: 2,
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          mb: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Button
            onClick={handlePrevMonth}
            variant="contained"
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              fontFamily: "Inter, sans-serif",
              bgcolor: "#1976D2",
              color: "white",
              borderRadius: "50%",
              mr: 1,
              "&:hover": { bgcolor: "#1565C0" },
            }}
          >
            ←
          </Button>
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#333",
              fontSize: "1.2rem",
              mx: 1,
            }}
          >
            {format(currentMonth, "MMMM yyyy")}
          </Typography>
          <Button
            onClick={handleNextMonth}
            variant="contained"
            sx={{
              minWidth: 32,
              width: 32,
              height: 32,
              fontFamily: "Inter, sans-serif",
              bgcolor: "#1976D2",
              color: "white",
              borderRadius: "50%",
              ml: 1,
              "&:hover": { bgcolor: "#1565C0" },
            }}
          >
            →
          </Button>
        </Box>
        <Typography
          sx={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.9rem",
            color: "#555",
            textAlign: "center",
            mb: 2,
          }}
        >
          Selected: {format(selectedDate, "eeee, dd/MM/yyyy")}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 1,
            mb: 1,
          }}
        >
          {weekdays.map((weekday, index) => (
            <Typography
              key={`weekday-${index}`}
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                color: "#666",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              {weekday}
            </Typography>
          ))}
        </Box>
        <motion.div
          key={format(currentMonth, "yyyy-MM")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {weeks.map((week, weekIndex) => (
            <Box
              key={`week-${weekIndex}`}
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                mb: 1,
              }}
            >
              {week.map((day, dayIndex) => (
                <Button
                  key={`day-${weekIndex}-${dayIndex}`}
                  sx={{
                    width: "100%",
                    height: 40,
                    borderRadius: "4px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    bgcolor:
                      day &&
                      format(day, "yyyy-MM-dd") ===
                        format(selectedDate, "yyyy-MM-dd")
                        ? "#4CAF50"
                        : day && isBefore(day, startOfDay(new Date()))
                        ? "#e0e0e0"
                        : day
                        ? "white"
                        : "#f5f5f5",
                    color:
                      day &&
                      format(day, "yyyy-MM-dd") ===
                        format(selectedDate, "yyyy-MM-dd")
                        ? "white"
                        : "#333",
                    border: "1px solid #e0e0e0",
                    "&:hover": {
                      bgcolor:
                        day && !isBefore(day, startOfDay(new Date()))
                          ? "#f0f0f0"
                          : day
                          ? "#e0e0e0"
                          : "#f5f5f5",
                    },
                    opacity: day
                      ? isBefore(day, startOfDay(new Date()))
                        ? 0.5
                        : 1
                      : 0.3,
                  }}
                  onClick={() => day && handleDayClick(day)}
                  disabled={!day || isBefore(day, startOfDay(new Date()))}
                >
                  {day ? day.getDate() : ""}
                </Button>
              ))}
            </Box>
          ))}
        </motion.div>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box
          sx={{
            bgcolor: "white",
            p: 2,
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "#333",
              mb: 1,
            }}
          >
            Available Time Slots
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
            }}
          >
            {slots.map((slot) => (
              <Button
                key={slot.id}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: "8px",
                  border:
                    bookingData.slotId === slot.id &&
                    availableSlots.includes(slot.id)
                      ? "2px solid #4CAF50"
                      : "1px solid #e0e0e0",
                  bgcolor: availableSlots.includes(slot.id)
                    ? "white"
                    : "#F5F5F5",
                  color: "#333",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  "&:hover": {
                    bgcolor: availableSlots.includes(slot.id)
                      ? "#f0f0f0"
                      : "#F5F5F5",
                    borderColor: availableSlots.includes(slot.id)
                      ? "#4CAF50"
                      : "#e0e0e0",
                  },
                  opacity:
                    availableSlots.includes(slot.id) && hasSlots ? 1 : 0.5,
                }}
                onClick={() => handleSelectSlot(slot)}
                disabled={!availableSlots.includes(slot.id) || !hasSlots}
              >
                {slot.time}
              </Button>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: "white",
            p: 2,
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "1.1rem",
              color: "#333",
              mb: 1,
            }}
          >
            Appointment Type
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // Căn giữa các nút
              gap: 2, // Giữ khoảng cách giữa hai nút
            }}
          >
            {["Online", "Offline"].map((type) => (
              <Button
                key={type}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: "8px",
                  border:
                    appointmentType === type
                      ? "2px solid #4CAF50"
                      : "1px solid #e0e0e0",
                  bgcolor: "white",
                  color: "#333",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  "&:hover": {
                    bgcolor: hasSlots ? "#f0f0f0" : "white",
                    borderColor: hasSlots ? "#4CAF50" : "#e0e0e0",
                  },
                  opacity: hasSlots ? 1 : 0.5,
                }}
                onClick={() => handleSelectAppointmentType(type)}
                disabled={!hasSlots}
              >
                {type}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
