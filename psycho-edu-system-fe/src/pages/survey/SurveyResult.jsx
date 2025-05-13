/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { DateRange, School } from "@mui/icons-material";
import { SurveyService } from "../../api/services/surveyService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
const SurveyResult = () => {
  const { studentId } = useParams();
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [surveyResults, setSurveyResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(null);
  useEffect(() => {
    const data = localStorage.getItem("user");
    const formattedData = JSON.parse(data);
    setRole(formattedData.role);
    const fetchSurveyResult = async () => {
      setLoading(true);
      try {
        const response = await SurveyService.getSurveyResult({
          month,
          year,
          studentId,
        });
        setSurveyResults(response);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error fetching survey result:", error);
        setSurveyResults(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyResult();
  }, [month, year, studentId]);

  const getBarColor = (points) => {
    if (points <= 9) return "#2ECC71";
    if (points <= 13) return "#F1C40F";
    if (points <= 20) return "#E67E22";
    return "#E74C3C";
  };
  const surveyResult = surveyResults[currentIndex] || null;
  const chartData = surveyResult
    ? {
        labels: surveyResult.dimensions.map((dim) => dim.dimensionName),
        datasets: [
          {
            type: "bar",
            label: "DASS-21 Score",
            data: surveyResult.dimensions.map((dim) => dim.points),
            backgroundColor: surveyResult.dimensions.map((dim) =>
              getBarColor(dim.points)
            ),
            borderRadius: 10,
            order: 2,
          },
        ],
      }
    : null;

  return (
    <motion.div
      className="flex flex-col items-center justify-center bg-white text-gray-900 px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <button
        onClick={() => navigate(-1)}
        className="fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
      >
        Back
      </button>
      <motion.h1 className="text-4xl font-extrabold mb-6 text-center">
        📊 Mental Health Assessment
      </motion.h1>

      <motion.div className="text-lg flex justify-center gap-8 bg-gray-100 px-6 py-3 rounded-lg shadow-md mb-6">
        <span className="text-green-600 text-xl">🟢 Mild: 0-9</span>
        <span className="text-yellow-500 text-xl">🟡 Moderate: 10-13</span>
        <span className="text-orange-500 text-xl">🟠 Severe: 14-20</span>
        <span className="text-red-500 text-xl">🔴 Extremely Severe: 21+</span>
      </motion.div>

      {/* Month & Year Selector */}
      <Grid container spacing={2} justifyContent="center" sx={{ mb: 4 }}>
        <Grid item>
          <FormControl
            sx={{
              minWidth: 160,
              backgroundColor: "white",
              boxShadow: 2,
              borderRadius: 2,
            }}
          >
            <InputLabel>Month</InputLabel>
            <Select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <MenuItem key={m} value={m}>
                  <DateRange sx={{ mr: 1, color: "#1976D2" }} /> Month {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl
            sx={{
              minWidth: 160,
              backgroundColor: "white",
              boxShadow: 2,
              borderRadius: 2,
            }}
          >
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                <MenuItem key={y} value={y}>
                  <School sx={{ mr: 1, color: "#1976D2" }} /> Year {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {loading ? (
        <motion.p className="text-2xl mt-8 text-gray-500">
          Loading data...
        </motion.p>
      ) : surveyResult ? (
        <motion.div className="grid grid-cols-2 gap-8 items-center mt-8">
          {/* Chart */}
          {chartData && (
            <motion.div
              className="w-[700px] h-[450px]"
              whileHover={{ scale: 1.05 }}
            >
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 21,
                      ticks: { font: { size: 16 } },
                    },
                    x: { ticks: { font: { size: 16 } } },
                  },
                  plugins: { legend: { display: false } },
                }}
              />
            </motion.div>
          )}
          {/* Survey Info */}
          <motion.div className="flex flex-col items-center space-y-5 text-xl">
            <Typography variant="h6" className="flex items-center gap-3">
              <strong className="text-blue-500 text-2xl">📌 Name:</strong>
              <span className="text-gray-900 font-medium">
                {surveyResult.studentName}
              </span>
            </Typography>

            <Typography variant="subtitle1" className="flex items-center gap-3">
              <strong className="text-green-500 text-2xl">📅 Date:</strong>
              <span className="text-gray-900 font-medium">
                {new Date(surveyResult.surveyDate).toLocaleDateString()}
              </span>
            </Typography>

            <Typography variant="h4" className="flex items-center gap-3">
              <strong className="text-yellow-500 text-3xl">
                ⭐ Total Score:
              </strong>
              <span className="text-gray-900 text-4xl font-bold">
                {surveyResult.totalPoints}
              </span>
            </Typography>
          </motion.div>
        </motion.div>
      ) : (
        <motion.p className="text-2xl mt-8 text-gray-500">
          No survey data found. Please select another period.
        </motion.p>
      )}

      {/* Next & Previous Buttons */}
      {surveyResults.length > 1 && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            className={`px-6 py-3 rounded-lg text-xl shadow-md ${
              currentIndex === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            ⬅️ Previous
          </button>

          <button
            onClick={() =>
              setCurrentIndex((prev) =>
                Math.min(prev + 1, surveyResults.length - 1)
              )
            }
            disabled={currentIndex === surveyResults.length - 1}
            className={`px-6 py-3 rounded-lg text-xl shadow-md ${
              currentIndex === surveyResults.length - 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700 text-white"
            }`}
          >
            Next ➡️
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SurveyResult;
