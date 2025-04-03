import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { startOfDay, parse } from "date-fns";

const PsychologistAppointmentCard = ({
  id,
  student,
  psychologist,
  date,
  timeRange,
  status,
  bookedBy,
  appointmentFor,
  isOnline,
  showParent,
  onChat,
  onCancel,
  onViewDetail, // Giữ prop này nhưng không dùng cho TARGET PROGRAM
}) => {
  const parseDate = (dateString) => {
    const parsed = parse(dateString, "EEE, dd-MM-yyyy", new Date());
    return startOfDay(parsed);
  };

  const currentDate = startOfDay(new Date());
  const appointmentDate = parseDate(date);
  const isPastDay = appointmentDate < currentDate;

  const displayStatus =
    isPastDay && status === "SCHEDULED" ? "COMPLETED" : status;

  const getStatusColorAndEffect = () => {
    switch (displayStatus) {
      case "AVAILABLE":
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-500",
          effect: "border-2 border-green-500",
        };
      case "SCHEDULED":
        return {
          bg: "bg-yellow-500",
          text: "text-yellow-500",
        };
      case "COMPLETED":
        return { bg: "bg-green-500", text: "text-green-500", effect: "" };
      case "CANCELLED":
        return { bg: "bg-red-500", text: "text-red-500", effect: "" };
      case "TARGET PROGRAM":
        return { bg: "bg-blue-500", text: "text-blue-500", effect: "" };
      default:
        return { bg: "bg-gray-500", text: "text-gray-500", effect: "" };
    }
  };

  const { bg, text, effect } = getStatusColorAndEffect();

  // Đặt type là "Offline" cho TARGET PROGRAM, các loại khác giữ nguyên
  const displayType =
    status === "TARGET PROGRAM"
      ? "Offline"
      : isOnline === null
      ? "N/A"
      : isOnline
      ? "Online"
      : "Offline";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.05)" }}
      onDoubleClick={status === "TARGET PROGRAM" ? undefined : onViewDetail} // Bỏ double-click cho TARGET PROGRAM
      className={`w-[300px] min-w-[250px] min-h-[200px] h-full ${effect}`}
    >
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-full flex flex-col gap-1.5">
        <div className="flex flex-col gap-1.5 flex-1">
          {/* Student */}
          <div className="flex items-start justify-between gap-2 min-h-[20px]">
            <span className="text-[0.85rem] font-semibold text-gray-600 w-[90px] pl-0">
              Student
            </span>
            <span className="text-[0.85rem] font-semibold text-gray-800 flex-1 text-right overflow-wrap break-words">
              {student}
            </span>
          </div>
          {/* Psychologist */}
          <div className="flex items-start justify-between gap-2 min-h-[20px]">
            <span className="text-[0.85rem] font-semibold text-gray-600 w-[90px] pl-0">
              Psychologist
            </span>
            <span className="text-[0.85rem] font-semibold text-gray-800 flex-1 text-right overflow-wrap break-words">
              {psychologist}
            </span>
          </div>
          {/* Parent (nếu có) */}
          <div className="flex items-start justify-between gap-2 min-h-[20px]">
            {showParent ? (
              <>
                <span className="text-[0.85rem] font-semibold text-gray-600 w-[90px] pl-0">
                  Parent
                </span>
                <span className="text-[0.85rem] font-semibold text-gray-800 flex-1 text-right overflow-wrap break-words">
                  {bookedBy}
                </span>
              </>
            ) : (
              <hr className="w-full border-gray-300" />
            )}
          </div>
          {/* Time */}
          <div className="flex items-start justify-between gap-2 min-h-[20px]">
            <span className="text-[0.85rem] font-semibold text-gray-800 w-auto pl-0 whitespace-nowrap">
              {date}
            </span>
            <span className="text-[0.85rem] font-semibold text-gray-800 flex-1 text-right">
              {timeRange}
            </span>
          </div>
          {/* Status */}
          <div className="flex items-center justify-between gap-2 min-h-[28px]">
            <span
              className={`flex items-center gap-2 text-[0.85rem] font-semibold w-[90px] pl-0 ${text}`}
            >
              <span className={`w-3 h-3 ${bg} rounded-full`}></span>
              {displayStatus.toUpperCase()}
            </span>
            <div className="flex-1 flex items-center justify-end gap-1.5 flex-wrap">
              {!isPastDay && displayStatus === "SCHEDULED" && (
                <>
                  {displayType === "Online" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onChat}
                      className="text-[0.8rem] text-white bg-green-500 rounded-lg px-2 py-0.5 hover:bg-green-600 transition-colors duration-200"
                    >
                      Join
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onCancel(id)}
                    className="text-[0.8rem] text-white bg-red-500 rounded-lg px-2 py-0.5 hover:bg-red-600 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Meeting Type (bỏ View Detail cho TARGET PROGRAM) */}
        <div className="flex justify-between items-center min-h-[20px]">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[0.8rem] font-medium text-blue-600 bg-blue-100 rounded-full px-1.5 py-0.5 inline-block"
          >
            {displayType}
          </motion.div>
          {status !== "TARGET PROGRAM" && (
            <motion.a
              whileHover={{ x: 5 }}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onViewDetail();
              }}
              className="text-[0.8rem] text-orange-500 hover:underline"
            >
              View detail
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

PsychologistAppointmentCard.propTypes = {
  id: PropTypes.string,
  student: PropTypes.string,
  psychologist: PropTypes.string,
  date: PropTypes.string,
  timeRange: PropTypes.string,
  status: PropTypes.string,
  bookedBy: PropTypes.string,
  appointmentFor: PropTypes.string,
  isOnline: PropTypes.bool,
  showParent: PropTypes.bool,
  onViewDetail: PropTypes.func,
  onChat: PropTypes.func,
  onCancel: PropTypes.func,
};

export default PsychologistAppointmentCard;
