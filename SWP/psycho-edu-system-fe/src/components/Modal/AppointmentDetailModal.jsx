import React, { useEffect, useState } from "react";
import { format, startOfDay, parse } from "date-fns";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import FeedbackForm from "./FeedbackForm";

const AppointmentDetailModal = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const [studentDetails, setStudentDetails] = useState(null);
  const [classDetails, setClassDetails] = useState(null);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [psychologistDetails, setPsychologistDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [role, setRole] = useState(null);

  const parseDate = (dateInput) => {
    if (typeof dateInput === "string") {
      const parsed = parse(dateInput, "EEE, dd-MM-yyyy", new Date());
      return startOfDay(parsed);
    } else if (dateInput instanceof Date) {
      return startOfDay(dateInput);
    } else {
      console.error("Invalid date input:", dateInput);
      return startOfDay(new Date());
    }
  };

  const currentDate = startOfDay(new Date());
  const appointmentDate = appointment ? parseDate(appointment.date) : null;
  const isPastDay = appointmentDate && appointmentDate < currentDate;

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (!appointment || !isOpen) return;

      try {
        setLoading(true);
        const authData = getAuthDataFromLocalStorage();
        const studentId =
          appointment.studentId || appointment.student || appointment.id;
        setRole(authData.role);
        if (
          !studentId ||
          typeof studentId !== "string" ||
          studentId.includes(" ")
        ) {
          throw new Error("Invalid student ID format");
        }

        const studentData = await apiService.fetchUserProfile(studentId);
        const birthYear = new Date(studentData.birthDay).getFullYear();
        const age = new Date().getFullYear() - birthYear;
        const batchNumber = 17 - (2003 - birthYear);
        const batch = `K${batchNumber}`;
        setStudentDetails({
          ...studentData,
          age,
          batch,
          university: "FPT University",
        });

        const classResponse = await apiService.fetchUserProfile(studentId); // Giả định tạm thời
        const classData = {
          classId: classResponse.classId || 0,
          className: classResponse.className || "Unknown",
          teacherId: classResponse.teacherId || "",
        };
        setClassDetails(classData);

        if (classData.teacherId) {
          const teacherData = await apiService.fetchUserProfile(
            classData.teacherId
          );
          const [day, month, year] = teacherData.birthDay.split("/");
          const teacherAge = 2025 - parseInt(year, 10);
          setTeacherDetails({ ...teacherData, age: teacherAge });
        }

        if (appointment.consultantId) {
          const psychologistData = await apiService.fetchUserProfile(
            appointment.consultantId
          );
          const [day, month, year] = psychologistData.birthDay.split("/");
          const psychologistAge = 2025 - parseInt(year, 10);
          setPsychologistDetails({ ...psychologistData, age: psychologistAge });
        }
      } catch (error) {
        console.error("Error fetching details:", error);
        setError("Failed to load appointment details");
        setStudentDetails({
          fullName: "Unknown Student",
          email: "",
          phone: "",
          birthDay: "",
          gender: "",
          address: "",
          age: 0,
          batch: "Unknown",
          university: "FPT University",
        });
        setClassDetails({ classId: 0, className: "Unknown", teacherId: "" });
        setTeacherDetails(null);
        setPsychologistDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAllDetails();
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const modalVariants = {
    hidden: { x: "100%", scale: 0.95 },
    visible: { x: 0, scale: 1.05, transition: { duration: 0.3 } },
    exit: {
      x: "100%",
      scale: 0.95,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const buttonVariants = {
    hover: { scale: 0.95, transition: { duration: 0.2 } },
    tap: { scale: 0.9, transition: { duration: 0.1 } },
  };

  const confirmModalVariants = {
    hidden: { opacity: 0, y: "-50%" },
    visible: { opacity: 1, y: "0%", transition: { duration: 0.2 } },
    exit: { opacity: 0, y: "-50%", transition: { duration: 0.2 } },
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

  const displayStatus = isPastDay ? "Completed" : appointment.status;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gray-800 bg-opacity-50 backdrop-blur-sm z-50 flex justify-end overflow-hidden"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="w-[min(32rem,95%)] h-full bg-gradient-to-br from-blue-100 via-purple-50 to-gray-100 p-6 rounded-l-xl shadow-2xl border-l-4 border-blue-600 flex flex-col"
      >
        <div className="flex flex-col min-h-full overflow-y-scroll scrollbar-hidden">
          <style jsx>{`
            .scrollbar-hidden {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hidden::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-4">
            <h3 className="text-[clamp(18px,2vw,20px)] font-semibold text-gray-800">
              Appointment Details
            </h3>
            <button
              onClick={() => setTimeout(onClose, 300)}
              className="text-gray-600 hover:text-gray-800 rounded-full p-1 hover:bg-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Nội dung chính */}
          <div className="space-y-6 flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-[60%]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 text-red-700 p-4 rounded-lg">
                <p className="text-[clamp(14px,1.5vw,16px)]">{error}</p>
              </div>
            ) : (
              <>
                {/* Student Information */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-[clamp(14px,1.5vw,16px)] font-medium text-gray-700 mb-3">
                    Student Info
                  </h4>
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-600 text-xl">👤</span>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Student Name
                      </p>
                      <p className="font-medium text-[clamp(16px,1.8vw,18px)] text-gray-800">
                        {studentDetails?.fullName || "Unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        University
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {studentDetails?.university || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Batch
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {studentDetails?.batch || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Age
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {studentDetails?.age || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Gender
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {studentDetails?.gender || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Email
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800 truncate">
                        {studentDetails?.email || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Phone
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {studentDetails?.phone || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Teacher Information */}
                {teacherDetails && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-[clamp(14px,1.5vw,16px)] font-medium text-gray-700 mb-3">
                      Teacher Info
                    </h4>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
                        <span className="text-green-600 text-xl">👨‍🏫</span>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Teacher Name
                        </p>
                        <p className="font-medium text-[clamp(16px,1.8vw,18px)] text-gray-800">
                          {teacherDetails.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Age
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {teacherDetails.age}
                        </p>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Gender
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {teacherDetails.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Email
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800 truncate">
                          {teacherDetails.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Phone
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {teacherDetails.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Psychologist Information */}
                {psychologistDetails && (
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="text-[clamp(14px,1.5vw,16px)] font-medium text-gray-700 mb-3">
                      Psychologist Info
                    </h4>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-purple-600 text-xl">👨‍⚕️</span>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Psychologist Name
                        </p>
                        <p className="font-medium text-[clamp(16px,1.8vw,18px)] text-gray-800">
                          {psychologistDetails.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Age
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {psychologistDetails.age}
                        </p>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Gender
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {psychologistDetails.gender}
                        </p>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Email
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800 truncate">
                          {psychologistDetails.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                          Phone
                        </p>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {psychologistDetails.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appointment Information */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h4 className="text-[clamp(14px,1.5vw,16px)] font-medium text-gray-700 mb-3">
                    Appointment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Date
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {format(appointment.date, "EEE, dd MMM yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Time
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {getTimeFromSlotId(appointment.slot)}
                      </p>
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Status
                      </p>
                      <div className="flex items-center min-h-[24px]">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${
                            displayStatus === "Cancelled"
                              ? "bg-red-500"
                              : displayStatus === "Completed"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        ></span>
                        <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                          {displayStatus}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Psychologist
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {appointment.meetingWith || "Unknown"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[clamp(12px,1.2vw,14px)] text-gray-500">
                        Meeting Type
                      </p>
                      <p className="font-medium text-[clamp(14px,1.5vw,16px)] text-gray-800">
                        {appointment.type}
                      </p>
                    </div>
                  </div>

                  <FeedbackForm appointment={appointment} role={role} />
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentDetailModal;
