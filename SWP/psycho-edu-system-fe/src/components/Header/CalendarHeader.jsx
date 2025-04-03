import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isSameDay, setMonth, startOfDay } from "date-fns";

const CalendarHeader = ({
  currentMonth,
  selectedDate,
  setSelectedDate,
  allDays,
  animationDirection,
  handlePrev,
  handleNext,
  handleSelectDate,
  getVisibleDays,
  handleNextMonth,
  handlePrevMonth,
}) => {
  const calendarContainerRef = useRef(null);

  const variants = {
    enter: (direction) => ({
      x: direction === "next" ? 50 : -50,
      opacity: 0.8,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 500, damping: 22, mass: 0.8 },
        opacity: { duration: 0.1 },
      },
    },
    exit: (direction) => ({
      x: direction === "next" ? -50 : 50,
      opacity: 0.8,
      transition: {
        x: { type: "spring", stiffness: 500, damping: 22, mass: 0.8 },
        opacity: { duration: 0.1 },
      },
    }),
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleMonthChange = (e) => {
    const selectedMonthIndex = parseInt(e.target.value, 10);
    const currentDate = new Date();
    let newDate;

    if (selectedMonthIndex === currentDate.getMonth()) {
      newDate = startOfDay(currentDate);
    } else {
      newDate = setMonth(currentMonth, selectedMonthIndex);
    }

    handleSelectDate(newDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 mb-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-4 md:space-y-0">
        <h1 className="text-white text-4xl font-medium">Your Schedule</h1>
        <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
          {/* Ngày được chọn */}
          <span className="text-blue-100 text-lg min-w-[200px] text-center">
            {format(selectedDate, "EEEE, MM/dd/yyyy")}
          </span>

          {/* Nút ngày và dropdown tháng */}
          <div className="flex items-center space-x-2">
            <button
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-800 flex items-center justify-center text-white transition-colors duration-200 shadow-md"
              onClick={handlePrev}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                />
              </svg>
            </button>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <select
                value={currentMonth.getMonth()}
                onChange={handleMonthChange}
                className="bg-white text-blue-900 rounded-lg pl-4 pr-8 py-2 text-sm border border-blue-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all duration-300 hover:shadow-xl hover:border-blue-400 appearance-none cursor-pointer"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23333333' width='18px' height='18px'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                  backgroundSize: "1rem",
                }}
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </motion.div>

            <button
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-800 flex items-center justify-center text-white transition-colors duration-200 shadow-md"
              onClick={handleNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={calendarContainerRef}
        className="relative overflow-hidden h-[70px]"
      >
        <AnimatePresence
          custom={animationDirection}
          initial={false}
          mode="sync"
        >
          <motion.div
            key={selectedDate.toISOString()}
            custom={animationDirection}
            variants={variants}
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.9 }}
            className="flex justify-center space-x-2 absolute w-full"
            transition={{ duration: 0.1 }}
          >
            {getVisibleDays().map((day) => (
              <motion.div
                key={day.day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={
                  isSameDay(day.fullDate, selectedDate)
                    ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          "0px 0px 0px rgba(0,0,0,0)",
                          "0px 0px 8px rgba(0,128,0,0.5)",
                          "0px 0px 0px rgba(0,0,0,0)",
                        ],
                      }
                    : {}
                }
                transition={
                  isSameDay(day.fullDate, selectedDate)
                    ? { duration: 0.3, ease: "easeInOut", times: [0, 0.5, 1] }
                    : {}
                }
                onClick={() => handleSelectDate(day.fullDate)}
                className={`flex-shrink-0 flex flex-col items-center justify-center rounded-lg transition-all duration-200 ${
                  isSameDay(day.fullDate, selectedDate)
                    ? "bg-green-500 cursor-pointer hover:bg-green-600"
                    : day.isToday
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-blue-400 hover:bg-blue-500 cursor-pointer"
                }`}
                style={{ width: "60px", height: "60px" }}
              >
                <span className="text-blue-100 text-sm">{day.dayOfWeek}</span>
                <span className="text-white text-xl font-medium">
                  {day.day}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CalendarHeader;
