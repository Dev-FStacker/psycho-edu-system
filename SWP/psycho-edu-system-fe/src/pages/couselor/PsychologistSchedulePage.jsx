import React, { useState, useEffect, useRef } from "react";
import { CContainer } from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import { useNavigate } from "react-router-dom";
import {
  format,
  addDays,
  getDaysInMonth,
  startOfMonth,
  isSameDay,
  startOfDay,
  addMonths,
  subMonths,
  parseISO,
  isValid,
} from "date-fns";
import moment from "moment";
import apiService from "../../services/apiService";
import CalendarHeader from "../../components/Header/CalendarHeader";
import PsychologistAppointmentDetail from "../../components/Modal/PsychologistAppointmentDetail";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import PsychologistAppointmentsList from "../../components/PsychologistSchedule/PsychologistAppointmentsList";
import { motion } from "framer-motion";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CButton,
} from "@coreui/react";
import axios from "axios";

const globalStyles = `
  :root {
    font-size: 14px;
  }
  * {
    box-sizing: border-box;
  }
`;

const PsychologistSchedulePage = () => {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = globalStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [targetPrograms, setTargetPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [confirmModalState, setConfirmModalState] = useState({
    visible: false,
    slotId: null,
  });
  const [detailModalState, setDetailModalState] = useState({
    isOpen: false,
    selectedSlot: null,
  });
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("");
  const [visibleDaysCount, setVisibleDaysCount] = useState(15);
  const [slotsViewKey, setSlotsViewKey] = useState(0);
  const calendarContainerRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [prevTeacherId, setPrevTeacherId] = useState(null);

  const navigate = useNavigate();
  const authData = getAuthDataFromLocalStorage();
  const teacherId = authData?.userId;
  const token = authData?.accessToken;

  const generateMonthDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const totalDays = getDaysInMonth(currentMonth);
    return Array.from({ length: totalDays }, (_, i) => {
      const currentDay = startOfDay(addDays(monthStart, i));
      return {
        day: currentDay.getDate(),
        weekday: format(currentDay, "E")[0],
        fullDate: currentDay,
        isToday: isSameDay(currentDay, new Date()),
        dayOfWeek: format(currentDay, "E")[0],
      };
    });
  };

  const allDays = generateMonthDays();

  useEffect(() => {
    if (prevTeacherId && teacherId && prevTeacherId !== teacherId) {
      setBookings([]);
      setAvailableSlots([]);
      setTargetPrograms([]);
      setUserProfile(null);
      setErrorMessage(null);
      setFilterStatus("All");
      setConfirmModalState({ visible: false, slotId: null });
      setDetailModalState({ isOpen: false, selectedSlot: null });
      setIsSuccessModalOpen(false);
      setCurrentPage(0);
      setAnimationDirection("");
      setVisibleDaysCount(15);
      setSlotsViewKey(0);
      setSelectedDate(startOfDay(new Date()));
      setCurrentMonth(startOfMonth(new Date()));
    }
    setPrevTeacherId(teacherId);
  }, [teacherId, prevTeacherId]);

  const loadUserProfile = async () => {
    try {
      if (!teacherId) {
        throw new Error("Authentication data not found. Please log in.");
      }
      const profile = await apiService.fetchUserProfile(teacherId);
      setUserProfile(profile);
    } catch (error) {
      console.error("Failed to load user:", error);
      setErrorMessage("Failed to load user profile.");
      setUserProfile(null);
    }
  };

  const fetchAppointments = async (date) => {
    try {
      const selectedDateStr = moment(date).format("YYYY-MM-DD");
      const appointments = await apiService.fetchConsultantAppointments(
        teacherId,
        selectedDateStr
      );
      const bookedSlots = appointments.map((appointment) => {
        let parsedDate;
        try {
          parsedDate = parseISO(
            appointment.date.split("/").reverse().join("-")
          );
          if (!isValid(parsedDate)) throw new Error("Invalid appointment date");
        } catch (error) {
          console.error("Invalid appointment date:", appointment.date, error);
          parsedDate = startOfDay(new Date(selectedDateStr));
        }
        const localDate = startOfDay(parsedDate);
        const startHour = parseInt(appointment.slotId, 10) + 7;
        return {
          id: appointment.appointmentId,
          title: "Booked Appointment",
          slot: appointment.slotId,
          date: localDate,
          start: moment(selectedDateStr)
            .set({ hour: startHour, minute: 0 })
            .toDate(),
          end: moment(selectedDateStr)
            .set({ hour: startHour + 1, minute: 0 })
            .toDate(),
          status: appointment.isCancelled
            ? "CANCELLED"
            : appointment.isCompleted
            ? "COMPLETED"
            : "SCHEDULED",
          details: {
            slotId: appointment.slotId,
            date: localDate,
            slotName: getTimeFromSlotId(appointment.slotId),
            status: appointment.isCancelled
              ? "CANCELLED"
              : appointment.isCompleted
              ? "COMPLETED"
              : "SCHEDULED",
            meetingWith: appointment.meetingWith || "You",
            studentId: appointment.studentId || null,
            appointmentId: appointment.appointmentId,
            bookedBy: appointment.bookedBy || "Unknown",
            appointmentFor: appointment.appointmentFor || "Unknown",
            isOnline: appointment.isOnline,
            googleMeetURL: appointment.googleMeetURL,
            notes: appointment.notes,
          },
        };
      });
      setBookings(bookedSlots);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setBookings([]);
    }
  };

  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    try {
      const selectedDateStr = moment(date).format("YYYY-MM-DD");
      const today = startOfDay(new Date());
      const availableSlotIds = await apiService.fetchConsultantSlots(
        teacherId,
        selectedDateStr
      );

      const slotMap = {
        1: { slotName: "08:00", startHour: 8 },
        2: { slotName: "09:00", startHour: 9 },
        3: { slotName: "10:00", startHour: 10 },
        4: { slotName: "11:00", startHour: 11 },
        5: { slotName: "13:00", startHour: 13 },
        6: { slotName: "14:00", startHour: 14 },
        7: { slotName: "15:00", startHour: 15 },
        8: { slotName: "16:00", startHour: 16 },
      };

      const filteredSlotIds = availableSlotIds.filter((slotId) => {
        const slotTime = slotMap[slotId]?.slotName;
        const slotDateTime = `${selectedDateStr}T${slotTime}:00`;
        return !targetPrograms.some(
          (program) => program.details.startDate === slotDateTime
        );
      });

      const psychologistAvailableSlots = filteredSlotIds
        .map((slotId) => {
          const slotInfo = slotMap[slotId];
          if (!slotInfo) {
            console.warn(`Invalid slotId from API: ${slotId}`);
            return null;
          }

          const parsedDate = startOfDay(new Date(selectedDateStr));
          return {
            id: `${selectedDateStr}-${slotId}`,
            title: "Available Slot",
            slot: slotId,
            date: parsedDate,
            start: moment(selectedDateStr)
              .set({ hour: slotInfo.startHour, minute: 0 })
              .toDate(),
            end: moment(selectedDateStr)
              .set({ hour: slotInfo.startHour + 1, minute: 0 })
              .toDate(),
            status: "AVAILABLE",
            details: {
              slotId: slotId,
              date: parsedDate,
              slotName: slotInfo.slotName,
              createAt: new Date().toISOString(),
              status: "AVAILABLE",
              studentId: null,
              meetingWith: userProfile?.fullName || "You",
              bookedBy: null,
              appointmentFor: null,
              isOnline: null,
              notes: null,
            },
          };
        })
        .filter((slot) => slot !== null);

      setAvailableSlots(psychologistAvailableSlots);
      setSlotsViewKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargetPrograms = async (date) => {
    try {
      const selectedDateStr = moment(date).format("YYYY-MM-DD");
      const response = await axios.get(
        `https://localhost:7192/api/TargetProgram/list?day=${selectedDateStr}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const programs = response.data || [];

      const filteredPrograms = programs.filter(
        (program) => program.counselor.userId === teacherId
      );

      const mappedPrograms = filteredPrograms.map((program) => ({
        id: program.programId,
        title: `Target Program: ${program.name}`,
        slot: getSlotIdFromTime(program.time),
        date: startOfDay(new Date(program.startDate)),
        start: moment(program.startDate).toDate(),
        end: moment(program.startDate).add(1, "hour").toDate(),
        status: "TARGET PROGRAM",
        details: {
          slotId: getSlotIdFromTime(program.time),
          date: startOfDay(new Date(program.startDate)),
          slotName: program.time,
          status: "TARGET PROGRAM",
          meetingWith: program.counselor.fullName,
          programId: program.programId,
          description: program.description,
          dimensionName: program.dimensionName,
          minPoint: program.minPoint,
          capacity: program.capacity,
          currentCapacity: program.currentCapacity,
          googleMeetURL: program.counselor.googleMeetURL,
          startDate: program.startDate,
        },
      }));
      setTargetPrograms(mappedPrograms);

      await fetchAvailableSlots(date);

      return mappedPrograms;
    } catch (error) {
      console.error("Error fetching target programs:", error);
      setTargetPrograms([]);
      return [];
    }
  };

  const getTimeFromSlotId = (slotId) => {
    const times = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
    ];
    return times[slotId - 1] || "Unknown";
  };

  const getSlotIdFromTime = (time) => {
    const slotMap = {
      "08:00": 1,
      "09:00": 2,
      "10:00": 3,
      "11:00": 4,
      "13:00": 5,
      "14:00": 6,
      "15:00": 7,
      "16:00": 8,
    };
    return slotMap[time] || null;
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await apiService.cancelAppointment(appointmentId);
      setConfirmModalState({ visible: false, slotId: null });
      await fetchAppointments(selectedDate);
      await fetchAvailableSlots(selectedDate);
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      setErrorMessage("Failed to cancel appointment.");
    }
  };

  const handleConfirmCancel = (appointmentId) => {
    setConfirmModalState({ visible: true, slotId: appointmentId });
  };

  const handleNext = () => {
    const nextDay = addDays(selectedDate, 1);
    setAnimationDirection("next");
    setSelectedDate(nextDay);
    fetchAppointments(nextDay);
    fetchTargetPrograms(nextDay).then(() => fetchAvailableSlots(nextDay));
    if (nextDay.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
    const nextDayIndex = allDays.findIndex((day) =>
      isSameDay(day.fullDate, nextDay)
    );
    const halfCount = Math.floor(visibleDaysCount / 2);
    const newPage = Math.max(
      0,
      Math.floor((nextDayIndex - halfCount) / visibleDaysCount)
    );
    setCurrentPage(newPage);
  };

  const handlePrev = () => {
    const prevDay = addDays(selectedDate, -1);
    setAnimationDirection("prev");
    setSelectedDate(prevDay);
    fetchAppointments(prevDay);
    fetchTargetPrograms(prevDay).then(() => fetchAvailableSlots(prevDay));
    if (prevDay.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
    const prevDayIndex = allDays.findIndex((day) =>
      isSameDay(day.fullDate, prevDay)
    );
    const halfCount = Math.floor(visibleDaysCount / 2);
    const newPage = Math.max(
      0,
      Math.floor((prevDayIndex - halfCount) / visibleDaysCount)
    );
    setCurrentPage(newPage);
  };

  const getVisibleDays = () => {
    const selectedDayIndex = allDays.findIndex((day) =>
      isSameDay(day.fullDate, selectedDate)
    );
    const halfCount = Math.floor(visibleDaysCount / 2);
    let startIndex = Math.max(0, selectedDayIndex - halfCount);
    if (startIndex + visibleDaysCount > allDays.length) {
      startIndex = Math.max(0, allDays.length - visibleDaysCount);
    }
    return allDays.slice(startIndex, startIndex + visibleDaysCount);
  };

  const handleSelectDate = (date) => {
    setAnimationDirection(date > selectedDate ? "next" : "prev");
    setSelectedDate(date);
    fetchAppointments(date);
    fetchTargetPrograms(date).then(() => fetchAvailableSlots(date));
    if (date.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(startOfMonth(date));
    }
    const dateIndex = allDays.findIndex((day) => isSameDay(day.fullDate, date));
    const halfCount = Math.floor(visibleDaysCount / 2);
    const newPage = Math.max(
      0,
      Math.floor((dateIndex - halfCount) / visibleDaysCount)
    );
    setCurrentPage(newPage);
  };

  const handleNavigateToRegistration = () => navigate("/psychologist/slot");

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(startOfMonth(addMonths(currentMonth, 1)));
    const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
    fetchAppointments(nextMonthStart);
    fetchTargetPrograms(nextMonthStart).then(() =>
      fetchAvailableSlots(nextMonthStart)
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(startOfMonth(subMonths(currentMonth, 1)));
    const prevMonthStart = startOfMonth(subMonths(currentMonth, 1));
    fetchAppointments(prevMonthStart);
    fetchTargetPrograms(prevMonthStart).then(() =>
      fetchAvailableSlots(prevMonthStart)
    );
  };

  const handleViewDetail = (slot) => {
    setDetailModalState({ isOpen: true, selectedSlot: slot });
  };

  const handleChat = (id) => {
    const slot = [...bookings, ...availableSlots, ...targetPrograms].find(
      (s) => s.id === id
    );
    navigate(`/chat/${id}`, {
      state: { googleMeetURL: slot?.details?.googleMeetURL || null },
    });
  };

  useEffect(() => {
    const updateVisibleDaysCount = () => {
      if (calendarContainerRef.current) {
        const containerWidth = calendarContainerRef.current.offsetWidth;
        const possibleDaysToShow = Math.floor(containerWidth / 70);
        setVisibleDaysCount(Math.max(5, possibleDaysToShow));
      }
    };
    updateVisibleDaysCount();
    window.addEventListener("resize", updateVisibleDaysCount);
    return () => window.removeEventListener("resize", updateVisibleDaysCount);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await loadUserProfile();
        if (teacherId) {
          await fetchAppointments(selectedDate);
          await fetchTargetPrograms(selectedDate).then(() =>
            fetchAvailableSlots(selectedDate)
          );
        }
      } catch (error) {
        setErrorMessage("Failed to initialize data.");
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, [teacherId]);

  const filteredAvailableSlots =
    filterStatus === "All"
      ? availableSlots
      : availableSlots.filter((s) => s.status === filterStatus);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <CContainer
        fluid
        className="max-w-screen-xl min-h-[100vh] mx-auto grid grid-rows-[auto_1fr] p-4"
      >
        <div ref={calendarContainerRef} className="w-full">
          <CalendarHeader
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            allDays={allDays}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            animationDirection={animationDirection}
            setAnimationDirection={setAnimationDirection}
            visibleDaysCount={visibleDaysCount}
            handlePrev={handlePrev}
            handleNext={handleNext}
            handleSelectDate={handleSelectDate}
            getVisibleDays={getVisibleDays}
            handleNextMonth={handleNextMonth}
            handlePrevMonth={handlePrevMonth}
          />
        </div>

        <div className="w-full flex-1 flex flex-col">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500 text-white rounded-lg mb-4 p-4 shadow-md"
            >
              <p>{errorMessage}</p>
            </motion.div>
          )}
          <motion.div
            key={slotsViewKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <PsychologistAppointmentsList
              isLoading={isLoading}
              filteredBookings={
                filterStatus === "All"
                  ? bookings
                  : bookings.filter((b) => b.status === filterStatus)
              }
              filteredAvailableSlots={filteredAvailableSlots}
              targetPrograms={targetPrograms}
              handleViewDetail={handleViewDetail}
              handleChat={handleChat}
              handleCancelAppointment={handleConfirmCancel}
              handleNavigate={handleNavigateToRegistration}
              selectedDate={selectedDate}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          </motion.div>
        </div>

        <ConfirmModal
          visible={confirmModalState.visible}
          onClose={() => setConfirmModalState({ visible: false, slotId: null })}
          onConfirm={() => handleCancelAppointment(confirmModalState.slotId)}
          appointmentId={confirmModalState.slotId}
        />

        <PsychologistAppointmentDetail
          isOpen={detailModalState.isOpen}
          onClose={() =>
            setDetailModalState({ isOpen: false, selectedSlot: null })
          }
          appointment={detailModalState.selectedSlot?.details}
          handleChat={handleChat}
          handleCancelAppointment={handleCancelAppointment}
        />

        <CModal
          visible={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          alignment="center"
        >
          <CModalHeader>
            <CModalTitle>Success!</CModalTitle>
          </CModalHeader>
          <CModalBody>Appointment cancelled successfully!</CModalBody>
          <CModalFooter>
            <CButton
              color="success"
              onClick={() => setIsSuccessModalOpen(false)}
            >
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </CContainer>
    </motion.div>
  );
};

export default PsychologistSchedulePage;
