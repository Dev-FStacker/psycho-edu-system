import { useState, useEffect } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SurveyResultPage = () => {
  const location = useLocation();
  const [chartData, setChartData] = useState(null);
  const [status, setStatus] = useState("");
  const [surveyDate, setSurveyDate] = useState("");
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, { autoClose: 3000 });
    }
    const data = localStorage.getItem("user");
    if (!data) {
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }
    const formattedData = JSON.parse(data);
    setRole(formattedData.role);

    const fetchedData = localStorage.getItem("surveyScores");
    if (!fetchedData) {
      setError("Không tìm thấy dữ liệu khảo sát.");
      return;
    }

    const parsedData = JSON.parse(fetchedData);
    setSurveyDate(new Date(parsedData.date).toLocaleDateString("vi-VN"));

    setChartData({
      labels: ["Căng Thẳng", "Lo Âu", "Trầm Cảm"],
      datasets: [
        {
          label: "Survey Scores",
          data: [
            parsedData["Căng Thẳng"],
            parsedData["Lo Âu"],
            parsedData["Trầm Cảm"],
          ],
          backgroundColor: [
            "rgba(251, 188, 5, 0.8)",
            "rgba(234, 67, 53, 0.8)",
            "rgba(66, 133, 244, 0.8)",
          ],
          borderColor: ["#FBBC05", "#EA4335", "#4285F4"],
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: ["#FFD700", "#FF4500", "#1E90FF"],
          barPercentage: 0.5,
        },
      ],
    });

    const totalScore =
      parsedData["Căng Thẳng"] + parsedData["Lo Âu"] + parsedData["Trầm Cảm"];
    setStatus(
      totalScore > 21
        ? "Rủi ro cao: Cần sự hỗ trợ ngay!"
        : totalScore > 12
        ? "Rủi ro trung bình: Cần chú ý kiểm soát tâm lý."
        : "Tâm lý ổn định, tiếp tục duy trì!"
    );
  }, [location.state]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Kết quả khảo sát tâm lý",
        font: { size: 22 },
      },
      tooltip: { callbacks: { label: (context) => `${context.raw}/21` } },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 21,
        ticks: { stepSize: 3 },
      },
    },
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 shadow-xl rounded-lg flex flex-col min-h-screen">
      <ToastContainer />
      <button
        onClick={() => navigate("/" + role)}
        className="fixed top-4 left-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
      >
        Back
      </button>
      <div className="text-center text-2xl font-bold text-gray-700 mb-4">
        Survey Results
      </div>
      <div className="text-md font-mono text-gray-500 text-center">
        {surveyDate}
      </div>
      {chartData ? (
        <div className="mt-6 relative flex-grow p-4 bg-white rounded-lg shadow-lg">
          <Bar data={chartData} options={chartOptions} />
        </div>
      ) : (
        <div className="text-center text-xl font-semibold text-gray-500 mt-8">
          Đang tải dữ liệu...
        </div>
      )}
      <div
        className="mt-6 text-center text-lg font-semibold p-4 rounded-lg text-white w-full"
        style={{
          backgroundColor: status.includes("cao")
            ? "#EA4335"
            : status.includes("trung bình")
            ? "#FBBC05"
            : "#34A853",
        }}
      >
        {status}
      </div>
    </div>
  );
};

export default SurveyResultPage;
