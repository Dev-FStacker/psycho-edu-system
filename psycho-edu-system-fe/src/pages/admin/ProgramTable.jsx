import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Typography,
  TextField,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

const ProgramTable = ({
  programs,
  role,
  loading,
  error,
  onSelectProgram,
  onUpdateProgram,
}) => {
  const [editingProgram, setEditingProgram] = useState(null);
  const [updatedProgram, setUpdatedProgram] = useState({});

  const handleEditClick = (program) => {
    setEditingProgram(program.programId);
    setUpdatedProgram({ ...program });
  };

  const handleInputChange = (e, field) => {
    setUpdatedProgram((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUpdate = () => {
    // Thêm validation
    if (updatedProgram.minPoint < 0 || updatedProgram.capacity < 0) {
      showError(
        "Invalid Input",
        "Minimum score and capacity must be non-negative."
      );
      return;
    }
    onUpdateProgram(updatedProgram);
    showSuccess("Success", "Program updated successfully!");
    setEditingProgram(null);
  };

  return (
    <div>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "8rem",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography
          align="center"
          sx={{
            color: "#1976D2",
            fontSize: "1.2rem",
            fontWeight: "bold",
            fontFamily: "Inter, sans-serif",
            my: 3,
          }}
        >
          Unable to load programs. Please try again later.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2, borderRadius: "12px" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#1976D2" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Program Name
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Description
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Min Score
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Dimension
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Capacity
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Date & Time
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.programId} hover>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {editingProgram === program.programId ? (
                      <TextField
                        value={updatedProgram.name}
                        onChange={(e) => handleInputChange(e, "name")}
                        size="small"
                        sx={{ fontFamily: "Inter, sans-serif" }}
                      />
                    ) : (
                      program.name
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {editingProgram === program.programId ? (
                      <TextField
                        value={updatedProgram.description}
                        onChange={(e) => handleInputChange(e, "description")}
                        size="small"
                        sx={{ fontFamily: "Inter, sans-serif" }}
                      />
                    ) : program.description.length > 50 ? (
                      `${program.description.substring(0, 50)}...`
                    ) : (
                      program.description
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {editingProgram === program.programId ? (
                      <TextField
                        value={updatedProgram.minPoint}
                        onChange={(e) => handleInputChange(e, "minPoint")}
                        size="small"
                        type="number"
                        sx={{ fontFamily: "Inter, sans-serif" }}
                      />
                    ) : (
                      program.minPoint
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {editingProgram === program.programId ? (
                      <Select
                        value={updatedProgram.dimensionName}
                        onChange={(e) => handleInputChange(e, "dimensionName")}
                        size="small"
                        sx={{ fontFamily: "Inter, sans-serif", minWidth: 120 }}
                      >
                        <MenuItem value={"Lo Âu"}>Lo Âu</MenuItem>
                        <MenuItem value={"Trầm Cảm"}>Trầm Cảm</MenuItem>
                        <MenuItem value={"Căng Thẳng"}>Căng Thẳng</MenuItem>
                      </Select>
                    ) : (
                      program.dimensionName
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {editingProgram === program.programId ? (
                      <TextField
                        value={updatedProgram.capacity}
                        onChange={(e) => handleInputChange(e, "capacity")}
                        size="small"
                        type="number"
                        sx={{ fontFamily: "Inter, sans-serif" }}
                      />
                    ) : (
                      `${program.currentCapacity}/${program.capacity}`
                    )}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {program.day} at {program.time}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Inter, sans-serif" }}>
                    {editingProgram === program.programId ? (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: "#388E3C",
                            color: "white",
                            "&:hover": { bgcolor: "#2E7D32" },
                            fontFamily: "Inter, sans-serif",
                          }}
                          onClick={handleUpdate}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          sx={{
                            color: "#FF6F61",
                            borderColor: "#FF6F61",
                            "&:hover": { borderColor: "#FF6F61" },
                            fontFamily: "Inter, sans-serif",
                          }}
                          onClick={() => setEditingProgram(null)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <>
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: "#26A69A",
                            color: "white",
                            "&:hover": { bgcolor: "#1D7A74" },
                            mr: 1,
                            fontFamily: "Inter, sans-serif",
                          }}
                          onClick={() => onSelectProgram(program)}
                        >
                          View Details
                        </Button>
                        {role === "Admin" && (
                          <Button
                            variant="contained"
                            sx={{
                              bgcolor: "#F57C00",
                              color: "white",
                              "&:hover": { bgcolor: "#E65100" },
                              fontFamily: "Inter, sans-serif",
                            }}
                            onClick={() => handleEditClick(program)}
                          >
                            Update
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default ProgramTable;
