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
} from "date-fns";
import axios from "axios";
import { motion } from "framer-motion";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import ChildSelector from "../../components/ParentSchedule/ChildSelector";
import CalendarHeader from "../../components/Header/CalendarHeader";
import ParentAppointmentsList from "../../components/ParentSchedule/ParentAppointmentsList"; // Import mới
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const globalStyles = `
  :root {
    font-size: 14px;
  }
  * {
    box-sizing: border-box;
  }
`;

const ParentSchedulePage = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [confirmModalState, setConfirmModalState] = useState({
    visible: false,
    appointmentId: null,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("");
  const [visibleDaysCount, setVisibleDaysCount] = useState(15);
  const [appointmentViewKey, setAppointmentViewKey] = useState(0);
  const calendarContainerRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [parentProfile, setParentProfile] = useState(null);

  const authData = getAuthDataFromLocalStorage();
  const parentId = authData?.userId;

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = globalStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

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

  const loadParentProfile = async () => {
    try {
      const profileResponse = await axios.get(
        `https://localhost:7192/api/User/profile?userId=${parentId}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (profileResponse.status === 200 && profileResponse.data.isSuccess) {
        setParentProfile(profileResponse.data.result);
      }
    } catch (error) {
      toast.error("Failed to load parent profile.", { position: "top-right" });
      setErrorMessage("Không thể tải thông tin phụ huynh: " + error.message);
    }
  };

  const loadAppointments = async (childId, date) => {
    if (!childId) return;
    setIsLoading(true);
    try {
      const selectedDateStr = format(date, "yyyy-MM-dd");
      const response = await axios.get(
        `https://localhost:7192/api/appointments/students/${childId}/appointments?selectedDate=${selectedDateStr}`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 && response.data.isSuccess) {
        const appointments = response.data.result || [];
        const events = appointments.map((appointment) => {
          const startDateTime = new Date(
            `${appointment.date
              .split("/")
              .reverse()
              .join("-")}T${getTimeFromSlotId(appointment.slotId)}`
          );
          const endDateTime = new Date(startDateTime);
          endDateTime.setMinutes(endDateTime.getMinutes() + 60);

          let title = `Meeting with ${appointment.meetingWith}`;
          if (appointment.meetingWith === "Counselor")
            title = "Mental Health Support";
          else if (appointment.meetingWith === "Teacher")
            title = "Career Guidance";

          return {
            id: appointment.appointmentId,
            title: `${title} ${appointment.isOnline ? "Online" : "Offline"}`,
            start: startDateTime,
            end: endDateTime,
            date: appointment.date.split("/").reverse().join("-"),
            status: appointment.isCancelled
              ? "Cancelled"
              : appointment.isCompleted
              ? "Completed"
              : "Scheduled",
            details: {
              studentId: childId,
              studentName: appointment.appointmentFor || "Unknown Student",
              consultantId: appointment.meetingWith,
              bookedBy: parentProfile ? parentProfile.fullName : "Parent",
              appointmentFor: appointment.appointmentFor,
              date: appointment.date.split("/").reverse().join("-"),
              slotId: appointment.slotId,
              time: getTimeFromSlotId(appointment.slotId),
              meetingType: appointment.isOnline ? "Online" : "Offline",
              isCompleted: appointment.isCompleted,
              isCancelled: appointment.isCancelled,
            },
          };
        });
        setBookings(events);
        setAppointmentViewKey((prev) => prev + 1);
        setErrorMessage(null);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
      setBookings([]);
      setErrorMessage("Không thể tải lịch hẹn: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointmentApi = async (appointmentId) => {
    try {
      const response = await axios.get(
        `https://localhost:7192/api/appointments/${appointmentId}/cancellation`,
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.isSuccess && response.data.statusCode === 200) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === appointmentId
              ? {
                  ...booking,
                  status: "Cancelled",
                  details: { ...booking.details, isCancelled: true },
                }
              : booking
          )
        );
        toast.success("Đã hủy cuộc hẹn thành công!", { position: "top-right" });
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      setErrorMessage("Không thể hủy cuộc hẹn: " + error.message);
      toast.error("Không thể hủy cuộc hẹn.", { position: "top-right" });  
    }
  };

  const handleNext = () => {
    const nextDay = addDays(selectedDate, 1);
    setAnimationDirection("next");
    setSelectedDate(nextDay);
    if (selectedChildId) loadAppointments(selectedChildId, nextDay);
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
    if (selectedChildId) loadAppointments(selectedChildId, prevDay);
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

  const handleSelectDate = async (date) => {
    setAnimationDirection(date > selectedDate ? "next" : "prev");
    setSelectedDate(date);
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
    if (selectedChildId) await loadAppointments(selectedChildId, date);
  };

  const handleCancelAppointment = (appointmentId) => {
    setConfirmModalState({ visible: true, appointmentId });
  };

  const handleNavigate = () => navigate("/parent/booking");

  const handleChat = (id) => {
    const appointment = bookings.find((appt) => appt.id === id);
    navigate(`/chat/${id}`, {
      state: { googleMeetURL: appointment?.googleMeetURL || null },
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(startOfMonth(addMonths(currentMonth, 1)));
    if (selectedChildId)
      loadAppointments(
        selectedChildId,
        startOfMonth(addMonths(currentMonth, 1))
      );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(startOfMonth(subMonths(currentMonth, 1)));
    if (selectedChildId)
      loadAppointments(
        selectedChildId,
        startOfMonth(subMonths(currentMonth, 1))
      );
  };

  const handleChildSelected = (childId) => {
    setSelectedChildId(childId);
    if (childId) loadAppointments(childId, selectedDate);
  };

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

  useEffect(() => {
    if (!parentId) {
      setErrorMessage("Không tìm thấy ID phụ huynh. Vui lòng đăng nhập lại.");
      return;
    }
    loadParentProfile();
  }, [parentId, authData?.accessToken]);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-screen bg-gray-50 flex items-center justify-center"
    >
      <CContainer
        fluid
        className="max-w-[1440px] min-h-[100vh] mx-auto grid grid-rows-[auto_1fr] p-4"
      >
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {parentProfile ? `${parentProfile.fullName}` : ""}
          </h1>
          <ChildSelector onChildSelected={handleChildSelected} />
        </div>

        {selectedChildId && (
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
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              handlePrev={handlePrev}
              handleNext={handleNext}
              handleSelectDate={handleSelectDate}
              getVisibleDays={getVisibleDays}
              handleNextMonth={handleNextMonth}
              handlePrevMonth={handlePrevMonth}
            />
          </div>
        )}

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
          {selectedChildId ? (
            <motion.div
              key={appointmentViewKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <ParentAppointmentsList
                isLoading={isLoading}
                filteredAppointments={
                  filterStatus === "All"
                    ? bookings
                    : bookings.filter(
                        (booking) => booking.status === filterStatus
                      )
                }
                handleCancelAppointment={handleCancelAppointment}
                handleChat={handleChat}
                handleNavigate={handleNavigate}
                selectedDate={selectedDate}
              />
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-600 text-lg">
                Vui lòng chọn một học sinh để xem lịch hẹn.
              </p>
            </div>
          )}
        </div>
        <ToastContainer />
      </CContainer>
    </motion.div>
  );
};

export default ParentSchedulePage;
