import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Định nghĩa các hàm phụ trợ
const getBarColor = (points) => {
  if (points <= 9) return "#2ECC71"; // Mild - Green
  if (points <= 13) return "#F1C40F"; // Moderate - Yellow
  if (points <= 20) return "#E67E22"; // Severe - Orange
  return "#E74C3C"; // Extremely Severe - Red
};

const getSeverityLabel = (points) => {
  if (points <= 9) return "Mild";
  if (points <= 13) return "Moderate";
  if (points <= 20) return "Severe";
  return "Extremely Severe";
};

const BASE_URL = "https://localhost:7192/";

// SurveyService cập nhật
const SurveyService = {
  getSurveyResults: async (studentId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}api/Survey/results?Userid=${studentId}`
      );
      console.log("API response:", response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error("Error fetching survey results:", error);
      throw error;
    }
  },
  getStudents: async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/User/students`);
      return response.data.result;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },
};

const PsychologistDashboard = () => {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [surveyResults, setSurveyResults] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch danh sách students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await SurveyService.getStudents();
        setStudents(data);
      } catch (err) {
        setError("Failed to fetch students");
      }
    };
    fetchStudents();
  }, []);

  // Fetch survey results khi chọn student
  useEffect(() => {
    const fetchSurveyResults = async () => {
      if (!studentId) {
        setSurveyResults([]);
        setSelectedSurvey(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const results = await SurveyService.getSurveyResults(studentId);
        setSurveyResults(results);
        setSelectedSurvey(results.length > 0 ? results[0] : null); // Chọn survey đầu tiên mặc định
      } catch (error) {
        setError("Failed to fetch survey results");
        setSurveyResults([]);
        setSelectedSurvey(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyResults();
  }, [studentId]);

  // Memoize chart data
  const chartData = useMemo(() => {
    if (!selectedSurvey) return null;
    return {
      labels: selectedSurvey.dimensions.map((dim) => dim.dimensionName),
      datasets: [
        {
          label: "DASS-21 Score",
          data: selectedSurvey.dimensions.map((dim) => dim.points),
          backgroundColor: selectedSurvey.dimensions.map((dim) =>
            getBarColor(dim.points)
          ),
          borderColor: "#2C3E50",
          borderWidth: 2,
        },
      ],
    };
  }, [selectedSurvey]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, max: 21, ticks: { font: { size: 16 } } },
      x: { ticks: { font: { size: 16 } } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const points = context.raw;
            return `${context.dataset.label}: ${points} (${getSeverityLabel(
              points
            )})`;
          },
        },
      },
    },
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center bg-white text-gray-900 px-4 py-8 md:px-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h1
        className="text-3xl md:text-4xl font-extrabold mb-6 text-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        📊 Psychologist Dashboard -{" "}
        <span className="text-blue-500">Student Mental Health Assessment</span>
      </motion.h1>

      {/* Severity Legend */}
      <motion.div
        className="flex flex-wrap justify-center gap-4 md:gap-8 bg-gray-100 px-6 py-3 rounded-lg shadow-md mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {[
          { color: "🟢", label: "Mild: 0-9", text: "text-green-600" },
          { color: "🟡", label: "Moderate: 10-13", text: "text-yellow-500" },
          { color: "🟠", label: "Severe: 14-20", text: "text-orange-500" },
          { color: "🔴", label: "Extremely Severe: 21+", text: "text-red-500" },
        ].map((item) => (
          <span
            key={item.label}
            className={`${item.text} text-base md:text-xl`}
          >
            {item.color} {item.label}
          </span>
        ))}
      </motion.div>

      {/* Student Selector */}
      <motion.div
        className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-2xl bg-gray-200 px-6 py-4 rounded-lg shadow-md mb-6"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="flex-1 px-4 py-2 rounded-md border border-gray-300 shadow-sm text-base md:text-xl focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} ({student.email})
            </option>
          ))}
        </select>
      </motion.div>

      {/* Survey Selector (nếu có nhiều survey) */}
      {surveyResults.length > 1 && (
        <motion.div
          className="w-full max-w-2xl mb-6"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <select
            value={selectedSurvey ? selectedSurvey.surveyDate : ""}
            onChange={(e) => {
              const selected = surveyResults.find(
                (survey) => survey.surveyDate === e.target.value
              );
              setSelectedSurvey(selected);
            }}
            className="w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm text-base md:text-xl focus:ring-2 focus:ring-blue-500"
          >
            {surveyResults.map((survey) => (
              <option key={survey.surveyDate} value={survey.surveyDate}>
                Survey Date: {new Date(survey.surveyDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Content */}
      {loading ? (
        <motion.p className="text-xl md:text-2xl mt-8 text-gray-500">
          Loading data...
        </motion.p>
      ) : error ? (
        <motion.p className="text-xl md:text-2xl mt-8 text-red-500">
          {error}
        </motion.p>
      ) : selectedSurvey ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start mt-8 w-full max-w-4xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {chartData && (
            <motion.div
              className="w-full h-[400px] md:h-[450px]"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Bar data={chartData} options={chartOptions} />
            </motion.div>
          )}
          <motion.div className="text-lg md:text-2xl space-y-4">
            <p>
              <strong className="text-blue-500">📌 Name:</strong>{" "}
              {selectedSurvey.studentName}
            </p>
            <p>
              <strong className="text-green-500">📅 Date:</strong>{" "}
              {new Date(selectedSurvey.surveyDate).toLocaleDateString()}
            </p>
            <p className="text-2xl md:text-3xl font-bold">
              <strong className="text-yellow-500">⭐ Total Score:</strong>{" "}
              <span
                className={
                  selectedSurvey.totalPoints > 13
                    ? "text-red-500"
                    : "text-green-500"
                }
              >
                {selectedSurvey.totalPoints} (
                {getSeverityLabel(selectedSurvey.totalPoints)})
              </span>
            </p>
            <div className="mt-4">
              <strong className="text-purple-500">📋 Recommendations:</strong>
              <p className="text-base md:text-lg mt-2">
                {selectedSurvey.totalPoints > 13
                  ? "Consider scheduling a counseling session"
                  : "Student appears to be in stable mental health"}
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <motion.p className="text-xl md:text-2xl mt-8 text-gray-500">
          {studentId
            ? "No survey data found for this student"
            : "Please select a student to view survey results"}
        </motion.p>
      )}
    </motion.div>
  );
};

export default PsychologistDashboard;
