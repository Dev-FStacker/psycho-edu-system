import { useState, useEffect, useCallback } from "react";
import { BookingProvider, useBooking } from "../../context/BookingContext";
import { ChildSelection } from "../../components/Booking/BookingSteps/ChildSelection";
import { ConsultantTypeSelection } from "../../components/Booking/BookingSteps/ConsultantTypeSelection";
import { ConsultantSelection } from "../../components/Booking/BookingSteps/ConsultantSelection";
import { DateTimeSelection } from "../../components/Booking/BookingSteps/DateTimeSelection";
import { ConfirmationStep } from "../../components/Booking/BookingSteps/ConfirmationStep";
import { useNavigate } from "react-router-dom";
import { getAuthDataFromLocalStorage } from "../../utils/auth";
import axios from "axios";
import { motion } from "framer-motion";
import apiService from "../../services/apiService";
import Swal from "sweetalert2";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
} from "@mui/material";

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

const BookingPageContent = () => {
  const { isParent, bookingData, updateBookingData, resetBookingData } =
    useBooking();
  const [step, setStep] = useState(1);
  const [totalSteps, setTotalSteps] = useState(5);
  const [studentId, setStudentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasCriticalError, setHasCriticalError] = useState(false);
  const navigate = useNavigate();
  const authData = getAuthDataFromLocalStorage();
  const userId = authData?.userId;

  const steps = isParent()
    ? [
        "Select Child",
        "Consultant Type",
        "Consultant",
        "Date & Time",
        "Confirm",
      ]
    : ["Consultant Type", "Consultant", "Date & Time", "Confirm"];

  const determineStudentId = useCallback(async () => {
    if (studentId) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!isParent()) {
        setStudentId(userId);
        updateBookingData({ appointmentFor: userId });
      } else if (bookingData.childId) {
        setStudentId(bookingData.childId);
        updateBookingData({ appointmentFor: bookingData.childId });
      } else {
        const response = await axios.get(
          `https://localhost:7192/api/relationships/parent/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = response.data.result || response.data;
        if (Array.isArray(result) && result.length > 0) {
          const firstChildId = result[0].studentId;
          setStudentId(firstChildId);
          updateBookingData({
            appointmentFor: firstChildId,
            childId: firstChildId,
          });
        } else {
          setError("There are no students associated with this account.");
          setHasCriticalError(true);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError("There are no students associated with this account.");
        setHasCriticalError(true);
      } else {
        setError("Unable to determine student ID: " + error.message);
        setHasCriticalError(true);
        swalWithConfig.fire({
          title: "Error",
          text: "Unable to determine student ID. Please try again.",
          icon: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    isParent,
    userId,
    bookingData.childId,
    authData?.accessToken,
    updateBookingData,
  ]);

  useEffect(() => {
    determineStudentId();
  }, [determineStudentId]);

  useEffect(() => {
    setTotalSteps(isParent() ? 5 : 4);
  }, [isParent]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleNextWithValidation = () => {
    const userInfoStep = isParent() ? 5 : 4;

    if (step === 1 && isParent() && !bookingData.childId) {
      swalWithConfig.fire({
        title: "Missing Selection",
        text: "Please select a child before proceeding.",
        icon: "warning",
      });
      return;
    }
    if (step === (isParent() ? 2 : 1) && !bookingData.consultantType) {
      swalWithConfig.fire({
        title: "Missing Selection",
        text: "Please select a consultant type before proceeding.",
        icon: "warning",
      });
      return;
    }
    if (step === (isParent() ? 3 : 2) && !bookingData.consultantId) {
      swalWithConfig.fire({
        title: "Missing Selection",
        text: "Please select a consultant before proceeding.",
        icon: "warning",
      });
      return;
    }
    if (
      step === (isParent() ? 4 : 3) &&
      (!bookingData.date || !bookingData.slotId || !bookingData.appointmentType)
    ) {
      swalWithConfig.fire({
        title: "Missing Selection",
        text: "Please select date, time, and appointment type before proceeding.",
        icon: "warning",
      });
      return;
    }
    if (step === userInfoStep) {
      if (!bookingData.userName || !bookingData.phone || !bookingData.email) {
        swalWithConfig.fire({
          title: "Missing Information",
          text: "Please fill in all required information!",
          icon: "warning",
        });
        return;
      }
    }

    if (step < totalSteps && !error) {
      setStep(step + 1);
    }
  };

  const handleConfirm = async () => {
    if (
      !studentId ||
      !bookingData.consultantId ||
      !bookingData.date ||
      !bookingData.slotId
    ) {
      swalWithConfig.fire({
        title: "Incomplete Steps",
        text: "Please complete all steps before confirming.",
        icon: "warning",
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingData.date);
    if (selectedDate < today) {
      swalWithConfig.fire({
        title: "Invalid Date",
        text: "The appointment date must be in the future.",
        icon: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const appointmentData = {
        bookedBy: userId,
        appointmentFor: studentId,
        meetingWith: bookingData.consultantId,
        date: bookingData.date,
        slotId: bookingData.slotId,
        isOnline: bookingData.appointmentType === "Online",
      };

      const response = await apiService.bookAppointment(appointmentData);

      if (!response.isSuccess) {
        throw new Error(response.message || "Failed to book appointment");
      }

      swalWithConfig.fire({
        title: "Success",
        text: "Appointment booked successfully!",
        icon: "success",
        timer: 2000,
      });
      setTimeout(() => {
        resetBookingData();
        navigate(isParent() ? "/parent/schedule" : "/student/schedule");
      }, 2000);
    } catch (error) {
      const errorMessage = error.message || "Failed to book appointment";
      setError(`Failed to book appointment: ${errorMessage}`);
      swalWithConfig.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (isParent()) {
      switch (step) {
        case 1:
          return <ChildSelection />;
        case 2:
          return <ConsultantTypeSelection />;
        case 3:
          return <ConsultantSelection />;
        case 4:
          return <DateTimeSelection />;
        case 5:
          return <ConfirmationStep />;
        default:
          return null;
      }
    }
    switch (step) {
      case 1:
        return <ConsultantTypeSelection />;
      case 2:
        return <ConsultantSelection />;
      case 3:
        return <DateTimeSelection />;
      case 4:
        return <ConfirmationStep />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", py: 8, fontFamily: "Inter, sans-serif" }}>
        <Typography>Loading data...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "960px",
        mx: "auto",
        p: 3,
        bgcolor: "white",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        sx={{ mb: 2, textAlign: "center" }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            background: "linear-gradient(to right, #26A69A, #FF6F61)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Book an Appointment
        </Typography>
        <Typography sx={{ color: "#666", mb: 2 }}>
          Follow the steps below to schedule your consultation
        </Typography>
        <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </motion.div>

      <Box sx={{ mb: 2 }}>{renderStepContent()}</Box>

      {!hasCriticalError && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "white",
            p: 2,
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Button
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            sx={{
              px: 4,
              py: 1,
              color: "#26A69A",
              borderColor: "#26A69A",
              borderRadius: "8px",
              fontFamily: "Inter, sans-serif",
              visibility: step > 1 ? "visible" : "hidden",
              opacity: isSubmitting ? 0.5 : 1,
              "&:hover": { borderColor: "#1D7A74", color: "#1D7A74" },
            }}
            variant="outlined"
          >
            Back
          </Button>
          <Button
            onClick={
              step < totalSteps ? handleNextWithValidation : handleConfirm
            }
            disabled={isSubmitting}
            sx={{
              px: 4,
              py: 1,
              bgcolor: step < totalSteps ? "#26A69A" : "#388E3C",
              color: "white",
              borderRadius: "8px",
              fontFamily: "Inter, sans-serif",
              opacity: isSubmitting ? 0.5 : 1,
              "&:hover": {
                bgcolor: step < totalSteps ? "#1D7A74" : "#2E7D32",
              },
            }}
            variant="contained"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white inline mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : null}
            {isSubmitting
              ? "Processing..."
              : step < totalSteps
              ? "Next"
              : "Confirm Booking"}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const BookingPage = () => {
  return (
    <BookingProvider>
      <BookingPageContent />
    </BookingProvider>
  );
};

export default BookingPage;
