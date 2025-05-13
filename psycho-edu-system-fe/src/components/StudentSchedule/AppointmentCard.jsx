import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { startOfDay, parse } from "date-fns"; // Thêm parse từ date-fns

const AppointmentsCard = ({
  student,
  lesson,
  date,
  timeRange,
  status,
  type,
  bookedBy,
  appointmentFor,
  slot,
  onJoin,
  onCancel,
  onViewDetail,
}) => {
  const isSelfBooked = bookedBy && bookedBy === appointmentFor; // Kiểm tra Student tự booking

  // Parse chuỗi date ("EEE, dd-MM-yyyy") thành đối tượng Date
  const parseDate = (dateString) => {
    // Parse chuỗi ngày theo định dạng "EEE, dd-MM-yyyy" (ví dụ: "Sun, 16-03-2025")
    const parsed = parse(dateString, "EEE, dd-MM-yyyy", new Date());
    // Chuẩn hóa về đầu ngày (00:00:00) theo giờ Việt Nam
    return startOfDay(parsed);
  };

  // Lấy ngày hiện tại và chuẩn hóa về đầu ngày theo giờ Việt Nam (UTC+7)
  const currentDate = startOfDay(new Date()); // Ngày hiện tại thực tế từ hệ thống
  const appointmentDate = parseDate(date); // Ngày của cuộc hẹn
  const isPastDay = appointmentDate < currentDate; // Kiểm tra ngày trong quá khứ

  // Gán status là "Completed" nếu là ngày trong quá khứ
  const displayStatus = isPastDay ? "Completed" : status;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.05)" }}
      onDoubleClick={onViewDetail}
      className="w-full h-[290px]"
    >
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full flex flex-col gap-4">
        {/* Nội dung chính */}
        <div className="flex flex-col gap-4 flex-1 mt-2">
          {/* Student */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[1rem] font-semibold text-gray-600 whitespace-nowrap">
              Student
            </span>
            <span className="text-[1rem] font-semibold text-gray-800 truncate max-w-[70%]">
              {student}
            </span>
          </div>
          {/* Psychologist */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[1rem] font-semibold text-gray-600 whitespace-nowrap">
              Psychologist
            </span>
            <span className="text-[1rem] font-semibold text-gray-800 truncate max-w-[70%]">
              {lesson}
            </span>
          </div>
          {/* Parent hoặc đường kẻ ngang */}
          <div className="flex items-center justify-between gap-2">
            {bookedBy &&
            bookedBy.trim() !== "" &&
            bookedBy !== appointmentFor ? (
              // Trường hợp Parent booking
              <>
                <span className="text-[1rem] font-semibold text-gray-600 whitespace-nowrap">
                  Parent
                </span>
                <span className="text-[1rem] font-semibold text-gray-800 truncate max-w-[70%]">
                  {bookedBy}
                </span>
              </>
            ) : (
              // Trường hợp Student tự booking hoặc bookedBy không hợp lệ
              <hr className="w-full border-gray-700" />
            )}
          </div>
          {/* Date & Time */}
          <div className="flex items-center justify-between h-3">
            <span className="text-[0.95rem] font-semibold text-gray-800">
              {timeRange}
            </span>
            <span className="text-[0.95rem] font-semibold text-gray-800">
              {date}
            </span>
          </div>
          {/* Status & Actions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span
                className={`flex items-center gap-2 text-[0.95rem] font-semibold ${
                  displayStatus === "Completed"
                    ? "text-green-500"
                    : displayStatus === "Cancelled"
                    ? "text-red-500"
                    : "text-yellow-500 animate-pulse"
                }`}
              >
                <span
                  className={`w-3 h-3 ${
                    displayStatus === "Completed"
                      ? "bg-green-500"
                      : displayStatus === "Cancelled"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  } rounded-full`}
                ></span>
                {displayStatus.toUpperCase()}
              </span>
              {!isPastDay && displayStatus === "Scheduled" && (
                <div className="flex gap-2 flex-wrap justify-end">
                  {type === "Online" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={onJoin}
                      className="text-[1rem] text-white bg-green-500 rounded-lg px-4 py-2 hover:bg-green-600 transition-colors duration-200"
                    >
                      Join
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={onCancel}
                    className="text-[1rem] text-white bg-red-500 rounded-lg px-4 py-2 hover:bg-red-600 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Type & View Detail */}
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[1rem] font-medium text-blue-600 bg-blue-100 rounded-full px-2 py-1"
          >
            {type}
          </motion.div>
          <motion.a
            whileHover={{ x: 5 }}
            href="#"
            onClick={onViewDetail}
            className="text-[0.95rem] text-orange-500 hover:underline"
          >
            View detail
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
};

AppointmentsCard.propTypes = {
  student: PropTypes.string,
  lesson: PropTypes.string,
  date: PropTypes.string,
  timeRange: PropTypes.string,
  status: PropTypes.string,
  type: PropTypes.string,
  bookedBy: PropTypes.string,
  appointmentFor: PropTypes.string,
  slot: PropTypes.number,
  onJoin: PropTypes.func,
  onCancel: PropTypes.func,
  onViewDetail: PropTypes.func,
};

export default AppointmentsCard;
