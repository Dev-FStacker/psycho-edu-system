import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Typography,
  CardContent,
  Grid,
  Card,
  FormControl,
  Box,
} from "@mui/material";
import { TargetProgramService } from "../../api/services/targetProgram";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/vi";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { toast } from "react-toastify";
import { showError } from "../../utils/swalConfig";

dayjs.extend(utc);
dayjs.extend(timezone);
const VN_TZ = "Asia/Ho_Chi_Minh";

const CreateProgramDialog = ({ open, onClose, reloadPrograms }) => {
  const [step, setStep] = useState(1);
  const [programData, setProgramData] = useState({
    name: "",
    description: "",
    minPoint: 0,
    capacity: 0,
    dimensionId: "",
    day: null,
    time: null,
    counselors: [],
  });
  const resetForm = () => {
    setStep(1);
    setProgramData({
      name: "",
      description: "",
      minPoint: 0,
      capacity: 0,
      dimensionId: "",
      day: null,
      time: null,
      counselors: [],
    });
  };
  const [counselors, setCounselors] = useState([]);

  useEffect(() => {
    if (programData.day && programData.time) {
      fetchCounselors();
    }
  }, [programData.day, programData.time]);

  const fetchCounselors = async () => {
    try {
      if (programData.day && programData.time) {
        var selectedDateTime = programData.day + "T" + programData.time;
        const response = await TargetProgramService.getAvailableCounselors(
          selectedDateTime
        );
        setCounselors(response.result);
        if (!response.result.length) {
          showError(
            "No Counselors",
            "No counselors available for this time. Please choose another slot."
          );
        }
      }
    } catch (error) {
      console.error("Error fetching counselors:", error);
      showError("Error", "Unable to fetch counselors. Please try again.");
    }
  };
  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    try {
      await TargetProgramService.createProgram(programData);
      reloadPrograms();
      toast.success("Program created successfully!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error creating program:", error);
      showError("Error", "Failed to create program. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      sx={{ "& .MuiDialog-paper": { fontFamily: "Inter, sans-serif" } }}
    >
      <DialogTitle
        sx={{
          fontFamily: "Inter, sans-serif",
          bgcolor: "#1976D2",
          color: "white",
        }}
      >
        Create Program
      </DialogTitle>
      <DialogContent>
        {step === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
            <Typography variant="h6" color="#1976D2">
              Program Details
            </Typography>

            <TextField
              label="Name"
              variant="outlined"
              fullWidth
              value={programData.name}
              onChange={(e) =>
                setProgramData({ ...programData, name: e.target.value })
              }
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              value={programData.description}
              onChange={(e) =>
                setProgramData({ ...programData, description: e.target.value })
              }
              multiline
              rows={3}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Min Point"
                type="number"
                variant="outlined"
                fullWidth
                value={programData.minPoint}
                onChange={(e) =>
                  setProgramData({ ...programData, minPoint: e.target.value })
                }
              />

              <TextField
                label="Capacity"
                type="number"
                variant="outlined"
                fullWidth
                value={programData.capacity}
                onChange={(e) =>
                  setProgramData({ ...programData, capacity: e.target.value })
                }
              />
            </Box>

            <FormControl fullWidth>
              <Typography variant="subtitle1" color="textSecondary">
                Select Dimension
              </Typography>
              <Select
                variant="outlined"
                value={programData.dimensionId}
                onChange={(e) =>
                  setProgramData({
                    ...programData,
                    dimensionId: e.target.value,
                  })
                }
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Choose a dimension...
                </MenuItem>
                <MenuItem value={1}>Lo Âu</MenuItem>
                <MenuItem value={2}>Trầm Cảm</MenuItem>
                <MenuItem value={3}>Căng Thẳng</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {step === 2 && (
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}
            >
              {/* Date & Time Selection */}
              <Typography variant="h6" color="primary">
                Select Date & Time
              </Typography>

              <DatePicker
                label="Date"
                value={
                  programData.day ? dayjs(programData.day).tz(VN_TZ) : null
                }
                onChange={(newValue) =>
                  setProgramData({
                    ...programData,
                    day: newValue
                      ? dayjs(newValue).tz(VN_TZ).format("YYYY-MM-DD")
                      : null,
                  })
                }
                format="DD/MM/YYYY"
                slotProps={{
                  textField: { fullWidth: true, variant: "outlined" },
                }}
              />

              <TimePicker
                label="Time"
                value={
                  programData.time
                    ? dayjs(programData.time, "HH:mm").tz(VN_TZ)
                    : null
                }
                onChange={(newValue) =>
                  setProgramData({
                    ...programData,
                    time: newValue
                      ? dayjs(newValue).tz(VN_TZ).format("HH:mm")
                      : null,
                  })
                }
                format="HH:mm"
                slotProps={{
                  textField: { fullWidth: true, variant: "outlined" },
                }}
              />

              {/* Counselor Selection */}
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                color="primary"
              >
                Select a Counselor
              </Typography>

              {counselors.length === 0 ? (
                <Typography
                  color="textSecondary"
                  sx={{ textAlign: "center", mt: 2 }}
                >
                  No available counselors for the selected date and time.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {counselors.map((counselor) => {
                    const isSelected = programData.counselors.includes(
                      counselor.userId
                    );
                    return (
                      <Grid item xs={12} sm={6} md={4} key={counselor.userId}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 1,
                            "&:hover": { boxShadow: 3 },
                          }}
                        >
                          <CardContent sx={{ textAlign: "left" }}>
                            <Typography variant="h6" title={counselor.fullName}>
                              {counselor.fullName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {counselor.gender} | 🎂{" "}
                              {dayjs(counselor.birthDay).format("DD/MM/YYYY")}
                            </Typography>
                            <Typography
                              variant="body2"
                              noWrap
                              title={counselor.address}
                            >
                              📍 {counselor.address}
                            </Typography>
                            <Typography variant="body2">
                              📞 {counselor.phone}
                            </Typography>
                            <Typography
                              variant="body2"
                              noWrap
                              title={counselor.email}
                            >
                              📧 {counselor.email}
                            </Typography>

                            <Button
                              variant={isSelected ? "contained" : "outlined"}
                              sx={{ mt: 1, width: "100%" }}
                              onClick={() =>
                                setProgramData((prev) => ({
                                  ...prev,
                                  counselors: isSelected
                                    ? prev.counselors.filter(
                                        (id) => id !== counselor.userId
                                      )
                                    : [counselor.userId],
                                }))
                              }
                            >
                              {isSelected ? "Deselect" : "Select"}
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </LocalizationProvider>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#F0F8FF" }}>
        {step > 1 && (
          <Button
            onClick={handleBack}
            sx={{ fontFamily: "Inter, sans-serif", color: "#1976D2" }}
          >
            Back
          </Button>
        )}
        {step === 1 ? (
          <Button
            onClick={handleNext}
            sx={{
              fontFamily: "Inter, sans-serif",
              bgcolor: "#26A69A",
              color: "white",
              "&:hover": { bgcolor: "#1D7A74" },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            sx={{
              fontFamily: "Inter, sans-serif",
              bgcolor: "#26A69A",
              color: "white",
              "&:hover": { bgcolor: "#1D7A74" },
            }}
          >
            Confirm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CreateProgramDialog;
