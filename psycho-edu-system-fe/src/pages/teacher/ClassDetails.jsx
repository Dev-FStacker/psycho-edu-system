import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { UserService } from "../../api/services/userService";
import { SurveyService } from "../../api/services/surveyService";

const ClassDetails = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [surveyLoading, setSurveyLoading] = useState(false);
  const studentsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await UserService.getStudentsFromClassId(classId);
        setStudents(response);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [classId]);

  // Xử lý khi nhấn nút "Làm khảo sát"
  const handleSurveyClick = async (studentId) => {
    setSurveyLoading(true);
    try {
      const surveyStatus = await SurveyService.checkUserSurveyStatus(studentId);
      if (surveyStatus.canTakeSurvey) {
        if (surveyStatus.surveys.length > 0) {
          const surveyData = await SurveyService.getSurveyContent(
            surveyStatus.surveys[0].surveyId
          );
          localStorage.setItem("questions", JSON.stringify(surveyData));
          console.log("Survey data saved to localStorage ✅");
        }
        navigate(`/survey/${studentId}`);
      } else {
        toast.info("Không có khảo sát nào khả dụng!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi kiểm tra trạng thái khảo sát!");
    } finally {
      setSurveyLoading(false);
    }
  };
  const handleViewSurveyResults = (studentId) => {
    navigate(`/overall-survey-result/${studentId}`);
  };
  // Lọc danh sách theo tìm kiếm
  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Phân trang
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const paginate = (pageNumber) => {
    if (
      pageNumber > 0 &&
      pageNumber <= Math.ceil(filteredStudents.length / studentsPerPage)
    ) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center bg-white text-black p-6"
    >
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">
        Class {classId} - Student List
      </h1>

      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4 p-2 border border-gray-300 rounded-lg w-96"
      />

      {loading ? (
        <p className="text-gray-500">Loading students...</p>
      ) : filteredStudents.length > 0 ? (
        <>
          <table className="w-full max-w-6xl border-collapse border border-gray-300 text-left shadow-2xl rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <th className="p-3 border border-gray-300">Name</th>
                <th className="p-3 border border-gray-300">Phone</th>
                <th className="p-3 border border-gray-300">Email</th>
                <th className="p-3 border border-gray-300">DOB</th>
                <th className="p-3 border border-gray-300">Address</th>
                <th className="p-3 border border-gray-300">Gender</th>
                <th className="p-3 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr
                  key={student.userId}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-300`}
                >
                  <td className="p-3 border border-gray-300">
                    {student.fullName}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {student.phone || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {student.email || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {student.birthDay
                      ? new Date(student.birthDay).toLocaleDateString("en-GB")
                      : "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {student.address || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {student.gender || "N/A"}
                  </td>
                  <td className="p-3 border border-gray-300 flex gap-3">
                    {/* Nút Làm Khảo Sát */}
                    <motion.button
                      onClick={() => handleSurveyClick(student.userId)}
                      className={`flex-1 px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all text-sm ${
                        surveyLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      disabled={surveyLoading}
                      whileHover={!surveyLoading ? { scale: 1.05 } : {}}
                      whileTap={!surveyLoading ? { scale: 0.95 } : {}}
                    >
                      {surveyLoading ? "Đang kiểm tra..." : "Làm khảo sát"}
                    </motion.button>

                    {/* Nút Xem Kết Quả */}
                    <motion.button
                      onClick={() => handleViewSurveyResults(student.userId)}
                      className={`flex-1 px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-all text-sm ${
                        surveyLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      disabled={surveyLoading}
                      whileHover={!surveyLoading ? { scale: 1.05 } : {}}
                      whileTap={!surveyLoading ? { scale: 0.95 } : {}}
                    >
                      Xem Kết Quả
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
          <div className="flex mt-4 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded-lg ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Trước
            </button>
            <span className="px-4 py-2 border rounded-lg bg-gray-200">
              Trang {currentPage} /{" "}
              {Math.ceil(filteredStudents.length / studentsPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage ===
                Math.ceil(filteredStudents.length / studentsPerPage)
              }
              className={`px-4 py-2 border rounded-lg ${
                currentPage ===
                Math.ceil(filteredStudents.length / studentsPerPage)
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Tiếp
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500">No students found for this class.</p>
      )}
    </motion.div>
  );
};

export default ClassDetails;
