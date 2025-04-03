import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";
import { SurveyService } from "../../api/services/surveyService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import TargetProgramsPage from "./TargetProgramsPage";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [surveyResult, setSurveyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSurveyResult = async () => {
    setLoading(true);
    try {
      const response = await SurveyService.getSurveyResult({ month, year });
      setSurveyResult(response.length > 0 ? response[0] : null);
    } catch (error) {
      console.error("Error fetching survey result:", error);
      setSurveyResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyResult();
  }, [month, year]);

  const getBarColor = (points) => {
    if (points <= 9) return "#4CAF50";
    if (points <= 13) return "#FFC107";
    if (points <= 20) return "#FF9800";
    return "#F44336";
  };

  const chartData = useMemo(() => {
    if (!surveyResult) return null;
    return {
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
    };
  }, [surveyResult]);

  return (
    <>
      <TargetProgramsPage />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-400 inline-block px-4 py-2 rounded-md">
            Mental Health Evaluation
          </h1>
        </motion.div>

        <div className="mt-8 flex flex-col items-center">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-40 p-2 bg-white shadow-md rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Month {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-40 p-2 bg-white shadow-md rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, i) => currentYear - i).map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="mt-8">
              <svg
                className="animate-spin h-12 w-12 text-blue-500 mx-auto"
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
            </div>
          ) : surveyResult ? (
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bar Chart */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="col-span-2 bg-white shadow-lg rounded-lg p-6"
              >
                {chartData && (
                  <div className="h-96">
                    <Bar
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: { y: { beginAtZero: true, max: 21 } },
                        plugins: { legend: { display: true } },
                      }}
                    />
                  </div>
                )}
              </motion.div>

              {/* Legend */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="bg-white shadow-lg rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <h3 className="text-lg font-bold mb-4">DASS-21 Levels</h3>
                <hr className="my-2" />
                {[
                  { color: "#4CAF50", label: "Normal (0-9)" },
                  { color: "#FFC107", label: "Moderate (10-13)" },
                  { color: "#FF9800", label: "Severe (14-20)" },
                  { color: "#F44336", label: "Extreme (21+)" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2 mt-2">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <p>{label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          ) : (
            <p className="mt-8 text-lg text-gray-500">
              No data available. Please select another period.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
