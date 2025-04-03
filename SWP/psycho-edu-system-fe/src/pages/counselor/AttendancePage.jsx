// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Pagination,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TargetProgramService } from "../../api/services/targetProgram";

const AttendancePage = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attendance, setAttendance] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        const data = await TargetProgramService.getEnrolledStudents(
          programId,
          page
        );

        if (data && data.isSuccess) {
          setStudents(data.result.students);
          setTotalPages(Math.ceil(data.result.totalRecords / 10));

          const initialAttendance = {};
          data.result.students.forEach((student) => {
            initialAttendance[student.id] = student.status;
          });
          setAttendance(initialAttendance);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Failed to fetch student data.");
      }
    };

    fetchEnrolledStudents();
  }, [programId, page]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = async () => {
    const attendanceData = students.map((student) => ({
      studentId: student.id,
      programId: programId,
      statusName: attendance[student.id] || "Absent",
    }));

    try {
      const responseData = await TargetProgramService.updateStudentAttendance(
        attendanceData
      );

      if (responseData) {
        setIsSubmitted(true);
        toast.success("Attendance updated successfully!");
      } else {
        toast.error("Failed to submit attendance.");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("An error occurred while submitting attendance.");
    }
  };

  if (isSubmitted) {
    return (
      <Container sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h4" color="success">
          ✅ Attendance Updated Successfully!
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={() => navigate(`/psychologist/programs`)}
        >
          Back to Target Program
        </Button>
        <ToastContainer position="top-right" autoClose={3000} />
      </Container>
    );
  }

  return (
    <Container>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Update Attendance</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <strong
                    style={{
                      color:
                        attendance[student.id] === "Attended" ? "green" : "red",
                    }}
                  >
                    {student.status}
                  </strong>
                </TableCell>
                <TableCell>
                  <RadioGroup
                    row
                    value={attendance[student.id] || ""}
                    onChange={(e) =>
                      handleAttendanceChange(student.id, e.target.value)
                    }
                  >
                    <FormControlLabel
                      value="Attended"
                      control={<Radio color="primary" />}
                      label="Attended"
                    />
                    <FormControlLabel
                      value="Absent"
                      control={<Radio color="secondary" />}
                      label="Absent"
                    />
                  </RadioGroup>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(event, value) => setPage(value)}
        sx={{ display: "flex", justifyContent: "center", mt: 3 }}
      />
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3, display: "block", mx: "auto" }}
        onClick={handleSubmitAttendance}
      >
        Submit Attendance
      </Button>
    </Container>
  );
};

export default AttendancePage;
