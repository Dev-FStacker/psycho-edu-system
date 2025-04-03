import React from "react";
import { CSpinner } from "@coreui/react";
import AppointmentsCard from "./AppointmentCard";
import { motion, AnimatePresence } from "framer-motion";
import { format, isValid } from "date-fns";

const AppointmentsList = ({
  isLoading,
  filteredAppointments = [], // Default empty array
  handleViewDetail,
  handleCancelAppointment,
  handleChat,
  handleNavigate,
  selectedDate,
}) => {
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

  const calculateTimeRange = (slotId) => {
    const startTime = getTimeFromSlotId(slotId);
    if (startTime === "Unknown") return "Unknown";
    const [hours, minutes] = startTime.split(":").map(Number);
    const endHours = hours + (minutes + 45 >= 60 ? 1 : 0); 
    const endMinutes = (minutes + 45) % 60;
    const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
      .toString()
      .padStart(2, "0")}`;
    return `${startTime} - ${endTime}`;
  };

  return (
    <div className="appointments-container h-full overflow-hidden flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <CSpinner color="primary" />
          </div>
        ) : filteredAppointments && filteredAppointments.length > 0 ? (
          <motion.div
            className="flex-1 px-6 py-6 grid grid-cols-3 gap-6 max-h-[calc(100vh-250px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence>
              {filteredAppointments.map((appointment) => {
                if (!appointment) return null;

                const isPsychologist = !!appointment.details;
                const details = isPsychologist
                  ? appointment.details
                  : appointment;

                return (
                  <AppointmentsCard
                    key={appointment.id || `appointment-${Math.random()}`}
                    student={details?.appointmentFor || "Unknown Student"}
                    lesson={details?.meetingWith || "Unknown Psychologist"}
                    date={
                      appointment.date && isValid(new Date(appointment.date))
                        ? format(new Date(appointment.date), "EEE, dd-MM-yyyy")
                        : "Invalid Date"
                    }
                    timeRange={
                      calculateTimeRange(details?.slot || details?.slotId) ||
                      details?.time ||
                      "Unknown"
                    }
                    status={appointment.status || details?.status || "Unknown"}
                    type={details?.type || "N/A"}
                    bookedBy={details?.bookedBy || "Unknown"}
                    appointmentFor={details?.appointmentFor || "Unknown"}
                    onJoin={() => handleChat(appointment.id)}
                    onCancel={() =>
                      handleCancelAppointment(
                        details?.appointmentId || appointment.id
                      )
                    }
                    onViewDetail={() => handleViewDetail(appointment)}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
            <h5 className="text-gray-600 text-[1.125rem] mb-4">
              No slots or appointments scheduled
            </h5>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNavigate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-[1rem] shadow-md"
            >
              Register New Slots
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsList;
