import { createContext, useContext, useState, useEffect } from "react";
import { getAuthDataFromLocalStorage } from "../utils/auth";

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    userId: "",
    userRole: "",
    childId: "",
    children: [],
    consultantType: "",
    consultantId: "",
    consultantName: "",
    date: "",
    time: "",
    slotId: 0,
    appointmentType: "Online",
    userName: "",
    phone: "",
    email: "",
    isHomeroomTeacher: false,
  });
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải dữ liệu ban đầu

  // Khởi tạo dữ liệu từ authData khi component mount
  useEffect(() => {
    const initializeBookingData = () => {
      const authData = getAuthDataFromLocalStorage();
      if (authData) {
        setBookingData((prev) => ({
          ...prev,
          userId: authData.userId || "",
          userRole: authData.role || "Student", // Mặc định Student nếu không có role
        }));
      }
      setIsLoading(false);
    };
    initializeBookingData();
  }, []);

  const resetBookingData = () => {
    const authData = getAuthDataFromLocalStorage();
    setBookingData({
      userId: authData?.userId || "",
      userRole: authData?.role || "Student",
      childId: "",
      children: [],
      consultantType: "",
      consultantId: "",
      consultantName: "",
      date: "",
      time: "",
      slotId: 0,
      appointmentType: "Online",
      userName: "",
      phone: "",
      email: "",
      isHomeroomTeacher: false,
    });
  };

  const updateBookingData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const isParent = () => {
    const authData = getAuthDataFromLocalStorage();
    return authData?.role === "Parent";
  };

  const value = {
    bookingData,
    updateBookingData,
    resetBookingData,
    isParent,
    isLoading,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
