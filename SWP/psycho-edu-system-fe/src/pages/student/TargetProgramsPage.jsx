/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import { TargetProgramService } from "../../api/services/targetProgram";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
} from "@mui/material";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";

const TargetProgramsPage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await TargetProgramService.getTargetPrograms();
        setPrograms(data);
      } catch (err) {
        setError("Failed to load programs.");
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const handleEnroll = async (programId) => {
    try {
      const result = await TargetProgramService.registerTargetProgram(
        programId
      );
      toast.success(result.message || "Successfully enrolled!");
    } catch (error) {
      toast.error("Failed to enroll. Please try again.");
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: programs.length > 1 ? Math.min(3, programs.length) : 1,
    slidesToScroll: 1,
    autoplay: programs.length > 1,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(2, programs.length) },
      },
      { breakpoint: 600, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div style={{ padding: "5px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#fff", // White text
          backgroundImage: "linear-gradient(to right, #1976d2, #64b5f6)", // Blue gradient
          padding: "8px 16px",
          borderRadius: "4px",
          display: "flex", // Keep the width tight around text
        }}
      >
        Target Programs
      </Typography>

      {loading ? (
        <Typography variant="h6" align="center">
          Loading programs...
        </Typography>
      ) : error ? (
        <Typography variant="h6" align="center" color="error">
          {error}
        </Typography>
      ) : programs.length > 3 ? (
        <Slider {...sliderSettings}>
          {programs.map((program) => (
            <ProgramCard
              key={program.programId}
              program={program}
              handleEnroll={handleEnroll}
            />
          ))}
        </Slider>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {programs.map((program) => (
            <Grid item xs={12} sm={6} md={4} key={program.programId}>
              <ProgramCard program={program} handleEnroll={handleEnroll} />
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  );
};

const ProgramCard = ({ program, handleEnroll }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={4}
        sx={{
          textAlign: "center",
          transition: "transform 0.3s",
          "&:hover": { transform: "scale(1.05)" },
        }}
      >
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#1976d2" }}
            >
              {program.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Date:</strong>{" "}
              {new Date(program.startDate).toLocaleDateString("en-GB")}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Time:</strong> {program.startDate.split("T")[1]}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Min Score:</strong> {program.minPoint}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Topic:</strong> {program.dimensionName}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Capacity:</strong>
              {program.currentCapacity}/{program.capacity}
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={1}>
              <strong>Counselor:</strong> {program.counselor.fullName}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleEnroll(program.programId)}
              disabled={program.capacity === 0}
              sx={{ mt: 2 }}
            >
              {program.capacity === program.currentCapacity ? "Full" : "Enroll"}
            </Button>
          </CardContent>
        </Card>
      </Paper>
    </motion.div>
  );
};

export default TargetProgramsPage;
