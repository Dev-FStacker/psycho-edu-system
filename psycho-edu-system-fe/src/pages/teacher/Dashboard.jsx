import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserService } from "../../api/services/userService";
import { FaChalkboardTeacher } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClasses, setFilteredClasses] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await UserService.getClass();
        setClasses(response);
        setFilteredClasses(response);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    setFilteredClasses(
      classes.filter(
        (classItem) =>
          classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          classItem.classId.toString().includes(searchTerm)
      )
    );
  }, [searchTerm, classes]);

  const handleViewDetails = (classId) => {
    navigate(`class/${classId}`);
  };
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col items-center bg-white text-black p-6 relative"
    >
      <motion.header
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-6 flex items-center gap-4"
      >
        <FaChalkboardTeacher className="text-5xl text-blue-500" />
        <h1 className="text-4xl font-bold drop-shadow-lg">Teacher Dashboard</h1>
      </motion.header>
      <motion.input
        type="text"
        placeholder="Search by class name or ID..."
        className="w-full max-w-lg p-3 mb-6 border rounded-lg shadow-md focus:ring-2 focus:ring-blue-400 transition-all"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        whileFocus={{ scale: 1.05 }}
      />
      {filteredClasses.length > 0 ? (
        <motion.table
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl border-collapse border border-gray-300 text-left shadow-lg rounded-lg overflow-hidden bg-white"
        >
          <thead>
            <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              <th className="p-3 border border-gray-300">Class ID</th>
              <th className="p-3 border border-gray-300">Class Name</th>
              <th className="p-3 border border-gray-300 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.map((classItem, index) => (
              <motion.tr
                key={classItem.classId}
                className={`transition-colors ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-300`}
                whileHover={{ scale: 1.02 }}
              >
                <td className="p-3 border border-gray-300">
                  {classItem.classId}
                </td>
                <td className="p-3 border border-gray-300">{classItem.name}</td>
                <td className="p-3 border border-gray-300 text-center">
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
                    onClick={() => handleViewDetails(classItem.classId)}
                  >
                    Xem chi tiết
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      ) : (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-600 text-center"
        >
          No classes found
        </motion.p>
      )}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute bottom-4 text-gray-500 text-sm"
      >
        <p>Empowering teachers with modern tools.</p>
      </motion.div>
    </motion.section>
  );
};

export default Dashboard;
