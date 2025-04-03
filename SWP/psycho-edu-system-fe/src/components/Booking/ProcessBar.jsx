import { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { Box, Card, Typography } from "@mui/material";

export const ProgressBar = ({ currentStep, isParent, setStep }) => {
  const steps = isParent
    ? [
        { label: "Child", description: "Select your child" },
        { label: "Consultant Type", description: "Choose consultant type" },
        { label: "Consultant", description: "Select your consultant" },
        { label: "Date & Time", description: "Choose date and time" },
        { label: "Confirm", description: "Review and confirm" },
      ]
    : [
        { label: "Consultant Type", description: "Choose consultant type" },
        { label: "Consultant", description: "Select your consultant" },
        { label: "Date & Time", description: "Choose date and time" },
        { label: "Confirm", description: "Review and confirm" },
      ];

  const [hoveredStep, setHoveredStep] = useState(null);

  const cardVariants = {
    inactive: { scale: 1, backgroundColor: "#f5f5f5", y: 0 },
    active: { scale: 1.05, backgroundColor: "#e3f2fd", y: -5 },
    completed: { scale: 1, backgroundColor: "#e8f5e9", y: 0 },
  };

  const handleStepClick = (stepIndex) => {
    setStep(stepIndex + 1);
  };

  return (
    <Box
      sx={{
        mb: 6,
        px: { xs: 1, sm: 2 },
        position: "relative",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: { xs: "5%", sm: "10%" },
          right: { xs: "5%", sm: "10%" },
          height: "4px",
          background: "linear-gradient(to right, #e0e0e0, #e0e0e0)",
          zIndex: 0,
          transform: "translateY(-50%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            height: "100%",
            background: "linear-gradient(to right, #4caf50, #81c784)",
            transition: "width 0.5s ease-in-out",
          },
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          width: "100%",
          maxWidth: "1200px",
          flexWrap: { xs: "wrap", sm: "nowrap" },
          gap: { xs: 2, sm: 1 },
          position: "relative",
          zIndex: 1,
        }}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep - 1;
          const isActive = index === currentStep - 1;
          const variant = isCompleted
            ? "completed"
            : isActive
            ? "active"
            : "inactive";

          return (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="inactive"
              animate={variant}
              whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
              onClick={() => handleStepClick(index)}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              sx={{
                width: { xs: "120px", sm: "150px" }, // Kích thước cố định
                height: { xs: "90px", sm: "100px" }, // Chiều cao cố định
                mx: "auto",
              }}
            >
              <Card
                sx={{
                  width: "100%", // Full width của motion.div
                  height: "100%", // Full height của motion.div
                  padding: { xs: 1, sm: 1.5 },
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: isActive
                    ? "#1e88e5"
                    : isCompleted
                    ? "#4caf50"
                    : "#e0e0e0",
                  boxShadow:
                    isActive || isCompleted
                      ? "0 4px 12px rgba(0, 0, 0, 0.2)"
                      : "0 2px 8px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                    borderColor: isCompleted ? "#388e3c" : "#1565c0",
                  },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isCompleted
                      ? "#4caf50"
                      : isActive
                      ? "#1e88e5"
                      : "#e0e0e0",
                    color: "#fff",
                    mb: 1,
                    transition: "background-color 0.3s ease",
                  }}
                >
                  {isCompleted ? (
                    <FaCheckCircle size={20} />
                  ) : (
                    <Typography
                      sx={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}
                    >
                      {index + 1}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    color: isCompleted
                      ? "#4caf50"
                      : isActive
                      ? "#1e88e5"
                      : "#666",
                    fontWeight: isActive ? 600 : 400,
                    transition: "color 0.3s ease",
                    wordBreak: "break-word",
                  }}
                >
                  {step.label}
                </Typography>
                {hoveredStep === index && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "80%", transition: { duration: 0.3 } }}
                    sx={{
                      height: "2px",
                      backgroundColor: isCompleted ? "#4caf50" : "#1e88e5",
                      mt: 1,
                      borderRadius: "2px",
                    }}
                  />
                )}
              </Card>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
};
