/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  Box,
  Divider,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";
import HealingIcon from "@mui/icons-material/Healing";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/auth/AuthContext";

const ProgramDialog = ({ selectedProgram, onClose }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext) || {};
  if (!selectedProgram) return null;

  return (
    <Dialog
      open={Boolean(selectedProgram)}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "12px",
          overflow: "hidden",
          backgroundColor: "#F8FAFC",
          border: "1px solid #E3EAF2",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          bgcolor: "#0A79BF",
          color: "white",
          py: 2,
          fontSize: "1.5rem",
        }}
      >
        🏥 {selectedProgram.name}
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers sx={{ px: 4, py: 3, bgcolor: "white" }}>
        <Grid container spacing={4}>
          {/* Program Details */}
          <Grid item xs={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#0A79BF", mb: 2 }}
            >
              📝 Program Details
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "#E3F2FD",
                borderRadius: "8px",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <List dense sx={{ color: "#333" }}>
                <ListItem>
                  <HealingIcon sx={{ mr: 1, color: "#0A79BF" }} />
                  <strong>Description: </strong> {selectedProgram.description}
                </ListItem>
                <ListItem>
                  <CalendarTodayIcon sx={{ mr: 1, color: "#0A79BF" }} />
                  <strong>Date: </strong> {selectedProgram.day}
                </ListItem>
                <ListItem>
                  <AccessTimeIcon sx={{ mr: 1, color: "#0A79BF" }} />
                  <strong>Time: </strong> {selectedProgram.time}
                </ListItem>
                <ListItem>
                  <PeopleIcon sx={{ mr: 1, color: "#0A79BF" }} />
                  <strong>Capacity: </strong>
                  {selectedProgram.currentCapacity}/{selectedProgram.capacity}
                </ListItem>
                <ListItem>
                  <strong>Minimum Score: </strong> {selectedProgram.minPoint}
                </ListItem>
                <ListItem>
                  <strong>Dimension: </strong> {selectedProgram.dimensionName}
                </ListItem>
              </List>
            </Box>
          </Grid>

          {/* Counselor Information */}
          <Grid item xs={6}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: "#0A79BF", mb: 2 }}
            >
              👨‍⚕️ Counselor Information
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "#E8F5E9",
                borderRadius: "8px",
                boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography>
                <strong>Name:</strong> {selectedProgram.counselor.fullName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedProgram.counselor.email}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedProgram.counselor.phone}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedProgram.counselor.address}
              </Typography>
              <Typography>
                <strong>Meet Link:</strong>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#FF7F00",
                    color: "white",
                    textTransform: "none",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "#E66A00" },
                    ml: 1,
                  }}
                  startIcon={<OpenInNewIcon />}
                  component={Link}
                  to={selectedProgram.counselor.googleMeetURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Google Meet
                </Button>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      {/* Actions */}
      <DialogActions
        sx={{ bgcolor: "#F0F8FF", py: 2, justifyContent: "center" }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: "#D32F2F",
            color: "white",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#B71C1C" },
            px: 3,
            py: 1,
          }}
        >
          Close
        </Button>
        {user?.role === "Psychologist" && (
          <Button
            onClick={() =>
              navigate(`/psychologist/attendance/${selectedProgram.programId}`)
            }
            variant="contained"
            sx={{
              bgcolor: "#2E7D32",
              color: "white",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#1B5E20" },
              px: 3,
              py: 1,
            }}
          >
            Take Attendance
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProgramDialog;
