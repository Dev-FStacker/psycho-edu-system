/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SurveyService } from "../../../api/services/surveyService";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  FormControl,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    target: "",
    title: "",
  });
  const navigate = useNavigate();

  const fetchSurveys = async () => {
    setLoading(true);
    const data = await SurveyService.getSurveys();
    setSurveys(data.map((survey) => ({ ...survey, isEditing: false })));
    setLoading(false);
  };
  const handleChangeSurvey = (id, field, value) => {
    setSurveys((prevSurveys) =>
      prevSurveys.map((survey) =>
        survey.surveyId === id ? { ...survey, [field]: value } : survey
      )
    );
  };
  const handleSaveSurvey = async (surveyId) => {
    const surveyToUpdate = surveys.find((s) => s.surveyId === surveyId);
    if (!surveyToUpdate) {
      toast.error("Survey not found!", { autoClose: 3000 });
      return;
    }

    try {
      await SurveyService.updateSurveyProperty(surveyId, surveyToUpdate);
      toast.success("Survey updated successfully!", { autoClose: 2000 });

      await fetchSurveys(); // Ensure the UI updates properly
    } catch (error) {
      toast.error("Failed to update survey.", { autoClose: 3000 });
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name); // Set the file name
      setFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.info("Please select a file to upload.");
      return;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("Description", formData.description);
    data.append("Target", formData.target);
    data.append("Title", formData.title);

    const success = await SurveyService.importSurvey(data);
    if (success) {
      toast.success("Survey imported successfully!");
      setFile(null);
      setFileName("");
      setFormData({
        description: "",
        target: "",
        title: "",
      });
      setIsModalOpen(false);
      fetchSurveys();
    } else {
      toast.error("Failed to import survey.");
    }
  };
  const deleteSurvey = (id) => {
    setSurveys(surveys.filter((s) => s.surveyId !== id));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen rounded-lg shadow-lg border border-gray-300">
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: "bold",
          textAlign: "center",
          color: "#1976d2",
        }}
      >
        Survey Management
      </Typography>
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 mb-6 rounded-full shadow-md transition duration-300 ease-in-out"
        onClick={() => setIsModalOpen(true)}
      >
        Import Survey
      </button>
      {loading ? (
        <p className="text-center text-gray-600">Loading surveys...</p>
      ) : surveys.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-6"
        >
          <TableContainer
            component={Paper}
            elevation={6}
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1565C0" }}>
                  {[
                    "Survey Name",
                    "Description",
                    "Target",
                    "Created At",
                    "Actions",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.map((survey) => (
                  <motion.tr
                    key={survey.surveyId}
                    whileHover={{ opacity: 0.8 }}
                    transition={{ duration: 0.3 }}
                    style={{ borderBottom: "1px solid #ddd" }}
                  >
                    <TableCell>
                      <TextField
                        variant="outlined"
                        size="small"
                        value={survey.surveyName}
                        onChange={(e) =>
                          handleChangeSurvey(
                            survey.surveyId,
                            "surveyName",
                            e.target.value
                          )
                        }
                        fullWidth
                        sx={{ bgcolor: "#f9f9f9", borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        variant="outlined"
                        size="small"
                        value={survey.description}
                        onChange={(e) =>
                          handleChangeSurvey(
                            survey.surveyId,
                            "description",
                            e.target.value
                          )
                        }
                        fullWidth
                        sx={{ bgcolor: "#f9f9f9", borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        readOnly
                        value={survey.surveyFor}
                        onChange={(e) =>
                          handleChangeSurvey(
                            survey.surveyId,
                            "surveyFor",
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                        sx={{ bgcolor: "#f9f9f9", borderRadius: 1 }}
                      >
                        <MenuItem value="Student">Student</MenuItem>
                        <MenuItem value="Parent">Parent</MenuItem>
                        <MenuItem value="Teacher">Teacher</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontWeight: "bold",
                        color: "#424242",
                      }}
                    >
                      {new Date(survey.createAt).toLocaleDateString("en-GB")}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        textAlign: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() =>
                          navigate(`/admin/survey/${survey.surveyId}`)
                        }
                        sx={{ borderRadius: 2 }}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => handleSaveSurvey(survey.surveyId)}
                        sx={{ borderRadius: 2 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => deleteSurvey(survey.surveyId)}
                        sx={{ borderRadius: 2 }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </motion.div>
      ) : (
        <p className="text-center text-gray-600">No surveys available.</p>
      )}

      {isModalOpen && (
        <div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="contained"
            color="primary"
          >
            Open Modal
          </Button>

          {/* Modal with MUI Dialog and Framer Motion */}
          <Dialog
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            maxWidth="sm"
            fullWidth
            scroll="body"
            PaperComponent={motion.div}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            sx={{
              backdropFilter: "blur(5px)", // Add backdrop blur effect
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
            }}
          >
            <DialogTitle
              sx={{
                backgroundColor: "#ffffff",
                textAlign: "center",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              <Box
                sx={{
                  display: "inline-block",
                  padding: "10px",
                  color: "blue",
                }}
              >
                Survey Information
              </Box>
            </DialogTitle>

            <DialogContent sx={{ backgroundColor: "#ffffff", padding: "20px" }}>
              <form onSubmit={handleSubmit}>
                {/* Title Input */}
                <TextField
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                />

                {/* Description Input */}
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  required
                />

                {/* Target Selection */}
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Target</InputLabel>
                  <Select
                    label="Target"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Target</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Parent">Parent</MenuItem>
                    <MenuItem value="Teacher">Teacher</MenuItem>
                  </Select>
                </FormControl>

                {/* File Upload */}
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  margin="normal"
                  component="label"
                  className="cursor-pointer py-3"
                >
                  Upload File (xlsx)
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    hidden
                  />
                </Button>
                {fileName && (
                  <p className="mt-2 text-gray-700 font-semibold">
                    Selected File: {fileName}
                  </p>
                )}
                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginTop: "20px" }}
                >
                  Import Survey
                </Button>
              </form>
            </DialogContent>

            <DialogActions sx={{ backgroundColor: "#ffffff" }}>
              <Button
                onClick={() => setIsModalOpen(false)}
                color="secondary"
                fullWidth
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default SurveyList;
